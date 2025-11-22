// api/custom-sofa-json.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const target = `${MAGENTO_HOST}/custom-sofa-json.php${qs}`;

  try {
    const upstream = await fetch(target, { method: 'GET', headers: { 'accept': 'application/json' }});
    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('custom-sofa-json proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
