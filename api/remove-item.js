// api/remove-item.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  const { cartId, itemId } = req.query;
  if (!cartId || !itemId) return res.status(400).json({ error: 'Missing cartId/itemId' });

  const target = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(String(cartId))}/items/${encodeURIComponent(String(itemId))}`;

  try {
    const upstream = await fetch(target, { method: 'DELETE', headers: { 'accept': 'application/json' }});
    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('remove-item proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
