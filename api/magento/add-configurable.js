export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const MAGENTO_HOST = "http://13.203.184.96";

    // Read raw body
    const bodyText = await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks).toString()));
      req.on("error", () => resolve(""));
    });

    let payload;
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    let { cartId, parentSku, cushionTypeId, fabricMaterialId, sofaLegTypeId, qty = 1 } = payload;

    if (!cartId || !parentSku || !cushionTypeId || !fabricMaterialId || !sofaLegTypeId) {
      return res.status(400).json({ 
        error: "Missing required fields" 
      });
    }

    // Clean values
    cartId = String(cartId).replace(/^"+|"+$/g, "");
    cushionTypeId = Number(cushionTypeId);
    fabricMaterialId = Number(fabricMaterialId);
    sofaLegTypeId = Number(sofaLegTypeId);
    qty = Number(qty);

    const target = `${MAGENTO_HOST}/rest/V1/guest-carts/${encodeURIComponent(cartId)}/items`;

    // Build Magento payload with 3 attributes
    const magentoPayload = {
      cartItem: {
        quote_id: cartId,
        sku: parentSku,
        qty: qty,
        product_option: {
          extension_attributes: {
            configurable_item_options: [
              { option_id: 150, option_value: cushionTypeId },
              { option_id: 151, option_value: fabricMaterialId },
              { option_id: 152, option_value: sofaLegTypeId }
            ]
          }
        }
      }
    };

    console.log("Magento Payload:", JSON.stringify(magentoPayload, null, 2));

    const upstream = await fetch(target, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(magentoPayload),
    });

    const upstreamText = await upstream.text();
    console.log("Magento Response:", upstream.status, upstreamText);

    res.status(upstream.status).setHeader("Content-Type", upstream.headers.get("content-type") || "text/plain");
    return res.send(upstreamText);
  } catch (err) {
    console.error("add-configurable proxy error:", err);
    return res.status(502).json({ error: "Proxy failed", detail: String(err) });
  }
}