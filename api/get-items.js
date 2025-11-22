// api/get-items.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  const cartId = String(req.query.cartId || '').replace(/^"+|"+$/g, '');
  if (!cartId) return res.status(400).json({ error: 'Missing cartId' });

  try {
    const target = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items`;
    const upstream = await fetch(target, { method: 'GET', headers: { 'accept': 'application/json' }});
    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('get-items proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
