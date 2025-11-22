// api/add-configurable.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!MAGENTO_HOST) return res.status(500).json({ error: 'MAGENTO_HOST not configured' });

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try { body = JSON.parse(req.rawBody || JSON.stringify(req.body)); } catch {}
  }

  const { cartId, parentSku, cushionTypeId, fabricMaterialId, sofaLegTypeId, qty = 1 } = body || {};

  if (!cartId || !parentSku || !cushionTypeId || !fabricMaterialId || !sofaLegTypeId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanCartId = String(cartId).replace(/^"+|"+$/g, '');
  const target = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items`;

  const magentoPayload = {
    cartItem: {
      quote_id: cleanCartId,
      sku: parentSku,
      qty: Number(qty || 1),
      product_option: {
        extension_attributes: {
          configurable_item_options: [
            { option_id: 150, option_value: Number(cushionTypeId) },
            { option_id: 151, option_value: Number(fabricMaterialId) },
            { option_id: 152, option_value: Number(sofaLegTypeId) }
          ]
        }
      }
    }
  };

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(magentoPayload)
    });

    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('add-configurable proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    return res.status(502).json({ error: 'Proxy failed', detail: String(err) });
  }
}
