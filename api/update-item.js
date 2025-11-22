// api/update-item.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const { cartId, itemId, qty } = body || {};
  if (!cartId || !itemId || qty === undefined) return res.status(400).json({ error: 'Missing fields' });

  const target = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(String(cartId))}/items/${encodeURIComponent(String(itemId))}`;

  try {
    const payload = { cartItem: { item_id: Number(itemId), qty: Number(qty), quote_id: String(cartId) } };
    const upstream = await fetch(target, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('update-item proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
