// api/magento/remove-item.js
import { buildForwardHeaders, setCors, fetchUpstream } from './_forward';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const body = req.body || (await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d||'{}'))); }));
  const { cartId, itemId } = body;
  if (!cartId || !itemId) return res.status(400).json({ error: 'Missing cartId/itemId' });

  try {
    const url = `/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(itemId)}`;
    const upstream = await fetchUpstream(url, {
      method: 'DELETE',
      headers: buildForwardHeaders(req)
    });

    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('remove-item error', err);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
