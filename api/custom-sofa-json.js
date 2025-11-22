// api/custom-sofa-json.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const upstreamUrl = `${MAGENTO_HOST}/custom-sofa-json.php${qs}`;

  try {
    // Build forward headers, keep important ones and force Host
    const forwardHeaders = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (['connection', 'content-length', 'accept-encoding'].includes(k)) continue;
      forwardHeaders[k] = v;
    }
    // Force Host header to Magento host (fixes Host-based 403 checks)
    try { forwardHeaders['host'] = new URL(MAGENTO_HOST).host; } catch (e) {}

    if (!forwardHeaders['accept']) forwardHeaders['accept'] = 'application/json';

    console.log('[proxy] upstreamUrl=', upstreamUrl);
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: forwardHeaders
    });

    const text = await upstream.text();
    console.log('[proxy] upstreamStatus=', upstream.status, 'content-type=', upstream.headers.get('content-type'));

    // Return upstream headers/body
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('[proxy] error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
