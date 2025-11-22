// api/magento/add-configurable.js
import { buildForwardHeaders, setCors, fetchUpstream } from './_forward';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const body = req.body || (await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d||'{}'))); }));
  const { cartId } = body;
  if (!cartId) return res.status(400).json({ error: 'Missing cartId' });

  try {
    const upstream = await fetchUpstream(`/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items`, {
      method: 'POST',
      headers: { ...buildForwardHeaders(req), 'content-type': 'application/json' },
      body: JSON.stringify(body.payload || body) // allow caller to pass payload or the params
    });

    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('add-configurable error', err);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
