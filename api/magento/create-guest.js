// api/magento/create-guest.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  try {
    const upstreamUrl = `${MAGENTO_HOST}/rest/V1/guest-carts`;
    const forwardHeaders = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (['connection', 'content-length', 'accept-encoding'].includes(k)) continue;
      forwardHeaders[k] = v;
    }
    try { forwardHeaders['host'] = new URL(MAGENTO_HOST).host; } catch {}
    forwardHeaders['accept'] = forwardHeaders['accept'] || 'application/json';

    const upstream = await fetch(upstreamUrl, { method: 'POST', headers: forwardHeaders });
    const text = await upstream.text();

    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');

    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('create-guest proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
