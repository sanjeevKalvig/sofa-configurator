// /api/get-items.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  try {
    const { cartId } = req.query || {};
    if (!cartId) return res.status(400).json({ error: 'Missing cartId' });

    const upstreamUrl = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items`;
    const headers = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (['connection','content-length','accept-encoding'].includes(k)) continue;
      headers[k] = v;
    }
    try { headers.host = new URL(MAGENTO_HOST).host; } catch(e){}

    const upstream = await fetch(upstreamUrl, { method: 'GET', headers: { ...headers, accept: 'application/json' } });
    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('[get-items] error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
