// api/magento/[...slug].js
export default async function handler(req, res) {
  const { slug = [] } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const MAGENTO_HOST = process.env.MAGENTO_HOST;
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

  if (!MAGENTO_HOST) {
    return res.status(500).json({ error: 'MAGENTO_HOST not configured' });
  }

  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const upstreamUrl = `${MAGENTO_HOST}/${path}${qs}`;

  try {
    // Build forward headers
    const forwardHeaders = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (['connection', 'content-length', 'accept-encoding'].includes(k)) continue;
      forwardHeaders[k] = v;
    }
    // Ensure Host header matches MAGENTO_HOST
    try { forwardHeaders['host'] = new URL(MAGENTO_HOST).host; } catch {}

    if (!forwardHeaders['accept']) forwardHeaders['accept'] = 'application/json';

    console.log('Proxying to:', upstreamUrl);
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: ['GET','HEAD'].includes(req.method) ? undefined : await (async () => {
        // For Vercel, req.body may be available; if not, read raw body
        if (req.body && Object.keys(req.body).length) return JSON.stringify(req.body);
        return undefined;
      })()
    });

    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    console.log('Upstream status:', upstream.status);
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('magento proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Upstream proxy failed', detail: String(err) });
  }
}
