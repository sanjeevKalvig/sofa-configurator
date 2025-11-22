// api/magento/get-items.js
import { buildForwardHeaders, setCors, fetchUpstream } from './_forward';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  const cartId = req.query.cartId;
  if (!cartId) return res.status(400).json({ error: 'Missing cartId' });

  try {
    const upstream = await fetchUpstream(`/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items`, {
      method: 'GET',
      headers: buildForwardHeaders(req)
    });
    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('get-items error', err);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
