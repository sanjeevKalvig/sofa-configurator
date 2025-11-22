// api/magento/create-guest.js
import { buildForwardHeaders, setCors, fetchUpstream } from './_forward';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const upstream = await fetchUpstream('/rest/V1/guest-carts', {
      method: 'POST',
      headers: buildForwardHeaders(req)
    });
    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('create-guest error', err);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
