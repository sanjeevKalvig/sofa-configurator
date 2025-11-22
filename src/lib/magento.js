// lib/magento.js
// Works in Vite dev (uses direct Magento REST relative paths / custom-sofa-json.php)
// and in production (calls serverless proxy /api/* routes on Vercel).

/**
 * Environment detection:
 * - Vite exposes `import.meta.env.DEV`
 * - Fall back to NODE_ENV check for non-Vite environments
 */
const isDev = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV)
  || process.env.NODE_ENV === "development";

/* ---------- Helper to call the appropriate endpoint ---------- */
function buildUrl(path) {
  // path may be absolute ("/rest/..." or "/api/...") or relative ("custom-sofa-json.php")
  if (isDev) {
    // Local: prefer direct Magento endpoints (Vite dev server should proxy /rest and /custom-sofa-json.php)
    if (!path.startsWith("/")) return `/${path}`;
    return path;
  } else {
    // Prod: ensure we call serverless API routes
    // Map known Magento REST paths to your serverless proxies if user accidentally passes a rest path
    if (path.startsWith("/rest/") || path.startsWith("/custom-sofa-json") || path.startsWith("/custom-sofa-json.php")) {
      // prefer API proxy
      if (path.includes("/rest/V1/guest-carts")) {
        return "/api/magento/create-guest";
      }
      return "/api/custom-sofa-json";
    }

    // if caller already passes /api/* use it
    if (path.startsWith("/api/")) return path;
    // otherwise, prefix with /api/
    return path.startsWith("/") ? `/api${path}` : `/api/${path}`;
  }
}

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

async function safeJsonOrText(res) {
  const text = await safeText(res);
  try { return JSON.parse(text); } catch { return text; }
}

/* ---------- Public API ---------- */

export async function ensureGuestCartId() {
  const key = "mg_guest_cart_id";
  let id = localStorage.getItem(key);
  if (id) {
    // strip quotes if Magento returned quoted string
    id = String(id).replace(/^"+|"+$/g, "");
    console.log("[mg] found existing cart id:", id);
    return id;
  }

  console.log("[mg] creating guest cart (isDev=" + isDev + ")");

  const url = isDev ? "/rest/V1/guest-carts" : buildUrl("/api/magento/create-guest");
  const opts = { method: "POST", headers: { "Content-Type": "application/json" } };

  const res = await fetch(url, opts);
  const text = await safeText(res);
  console.log("[mg] create-guest status:", res.status, text);

  if (!res.ok) throw new Error("Failed to create guest cart: " + text);

  // Magento often returns a raw string like "abc123" (possibly JSON quoted)
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  const cartId = typeof parsed === "string" ? parsed.replace(/^"+|"+$/g, "") : String(parsed);
  localStorage.setItem(key, cartId);
  return cartId;
}

export async function addConfigurableToGuestCart({ cartId, parentSku, cushionTypeId, fabricMaterialId, sofaLegTypeId, qty = 1 }) {
  if (!cartId) throw new Error("Missing cartId");
  const cleanCartId = String(cartId).replace(/^"+|"+$/g, "");
  const cleanQty = Number(qty) || 1;

  // CONFIGURABLE payload (Magento expects attribute ids for option_id)
  const configurablePayload = {
    cartItem: {
      sku: parentSku,
      qty: cleanQty,
      quote_id: cleanCartId,
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

  // Build target URL depending on env
  const url = isDev
    ? `/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items`
    : "/api/add-configurable";

  // In prod our /api/add-configurable expects { cartId, payload } OR raw payload.
  const body = isDev ? JSON.stringify(configurablePayload) : JSON.stringify({ cartId: cleanCartId, payload: configurablePayload });

  console.log("[mg] add-configurable ->", url, configurablePayload);
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body });
  const txt = await safeText(res);
  console.log("[mg] add-configurable response:", res.status, txt);

  if (res.ok) {
    try { return JSON.parse(txt); } catch { return txt; }
  }

  // If configurable approach fails, fallback to child-SKU behavior (existing mapping)
  console.warn("[mg] configurable add failed, attempting child-SKU fallback");

  const optionLabels = {
    cushion_type: { 18: "Comfort Foam", 19: "Feather Touch", 20: "Memory Cloud" },
    fabric_material: { 15: "Premium Leather", 16: "Soft Fabric", 17: "Royal Velvet" },
    sofa_leg_type: { 21: "Modern Steel", 22: "Wooden Classic", 23: "Black Metal" }
  };
  const cushionLabel = optionLabels.cushion_type[cushionTypeId];
  const fabricLabel = optionLabels.fabric_material[fabricMaterialId];
  const legLabel = optionLabels.sofa_leg_type[sofaLegTypeId];
  const childSku = cushionLabel && fabricLabel && legLabel ? `UDSOFA-PARENT-${cushionLabel}-${fabricLabel}-${legLabel}` : null;

  if (!childSku) throw new Error("Add configurable failed and child SKU not available: " + txt);

  const childPayload = { cartItem: { sku: childSku, qty: cleanQty, quote_id: cleanCartId } };

  const childUrl = isDev
    ? `/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items`
    : "/api/add-configurable";
  const childBody = isDev ? JSON.stringify(childPayload) : JSON.stringify({ cartId: cleanCartId, payload: childPayload });

  console.log("[mg] child-SKU add ->", childUrl, childPayload);
  const res2 = await fetch(childUrl, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: childBody });
  const txt2 = await safeText(res2);
  console.log("[mg] child add response:", res2.status, txt2);

  if (!res2.ok) throw new Error("Child SKU add failed: " + txt2);
  try { return JSON.parse(txt2); } catch { return txt2; }
}

export async function getGuestCartItems(cartId) {
  if (!cartId) throw new Error("Missing cartId");
  const clean = String(cartId).replace(/^"+|"+$/g, "");
  const url = isDev
    ? `/rest/V1/guest-carts/${encodeURIComponent(clean)}/items`
    : `/api/get-items?cartId=${encodeURIComponent(clean)}`;

  console.log("[mg] getGuestCartItems ->", url);
  const res = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
  const txt = await safeText(res);
  console.log("[mg] get-items status:", res.status, txt);
  if (!res.ok) throw new Error("Failed to fetch cart items: " + txt);
  try { return JSON.parse(txt); } catch { return txt; }
}

export async function updateGuestCartItem(cartId, itemId, qty) {
  if (!cartId) throw new Error("Missing cartId");
  if (!itemId) throw new Error("Missing itemId");
  if (qty === undefined || qty === null) throw new Error("Missing qty");

  const cleanCartId = String(cartId).replace(/^"+|"+$/g, "");
  const cleanItemId = Number(itemId);
  const cleanQty = Number(qty);

  if (isDev) {
    const url = `/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items/${encodeURIComponent(cleanItemId)}`;
    const payload = { cartItem: { item_id: cleanItemId, qty: cleanQty, quote_id: cleanCartId } };
    console.log("[mg] updateGuestCartItem (dev) ->", url, payload);
    const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("Failed to update cart item: " + (await safeText(res)));
    return safeJsonOrText(res);
  } else {
    // Prod: our serverless endpoint /api/update-item expects { cartId, itemId, qty }
    console.log("[mg] updateGuestCartItem -> /api/update-item", { cartId: cleanCartId, itemId: cleanItemId, qty: cleanQty });
    const res = await fetch("/api/update-item", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cartId: cleanCartId, itemId: cleanItemId, qty: cleanQty }) });
    const txt = await safeText(res);
    if (!res.ok) throw new Error("Failed to update cart item: " + txt);
    try { return JSON.parse(txt); } catch { return txt; }
  }
}

export async function removeGuestCartItem(cartId, itemId) {
  if (!cartId) throw new Error("Missing cartId");
  if (!itemId) throw new Error("Missing itemId");

  const cleanCartId = String(cartId).replace(/^"+|"+$/g, "");
  const cleanItemId = Number(itemId);

  if (isDev) {
    const url = `/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items/${encodeURIComponent(cleanItemId)}`;
    console.log("[mg] removeGuestCartItem (dev) ->", url);
    const res = await fetch(url, { method: "DELETE" });
    const txt = await safeText(res);
    if (!res.ok) throw new Error("Failed to remove cart item: " + txt);
    try { return JSON.parse(txt); } catch { return txt; }
  } else {
    console.log("[mg] removeGuestCartItem -> /api/remove-item", { cartId: cleanCartId, itemId: cleanItemId });
    const res = await fetch("/api/remove-item", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cartId: cleanCartId, itemId: cleanItemId }) });
    const txt = await safeText(res);
    if (!res.ok) throw new Error("Failed to remove cart item: " + txt);
    try { return JSON.parse(txt); } catch { return txt; }
  }
}

export async function fetchProductData(sku = "UDSOFA-PARENT") {
  if (isDev) {
    const url = `/custom-sofa-json.php?sku=${encodeURIComponent(sku)}`;
    console.log("[mg] fetchProductData (dev) ->", url);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch product data: " + (await safeText(res)));
    return res.json();
  } else {
    const url = `/api/custom-sofa-json?sku=${encodeURIComponent(sku)}`;
    console.log("[mg] fetchProductData (prod) ->", url);
    const res = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error("Failed to fetch product data: " + (await safeText(res)));
    return res.json();
  }
}
