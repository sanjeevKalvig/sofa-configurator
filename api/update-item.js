// /api/update-item.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  try {
    const { cartId, itemId, qty } = req.body || {};
    if (!cartId || !itemId || qty === undefined || qty === null) return res.status(400).json({ error: 'Missing parameters' });

    const upstreamUrl = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(itemId)}`;
    const headers = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (['connection','content-length','accept-encoding'].includes(k)) continue;
      headers[k] = v;
    }
    try { headers.host = new URL(MAGENTO_HOST).host; } catch(e){}

    const payload = { cartItem: { item_id: Number(itemId), qty: Number(qty), quote_id: cartId } };

    const upstream = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: { ...headers, accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('[update-item] error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
