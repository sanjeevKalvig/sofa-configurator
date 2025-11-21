// VITE_MAGENTO_BASE comes from .env.local (dev) or Vercel env (prod)
const ENV_BASE = import.meta.env.VITE_MAGENTO_BASE ?? "";
const isLocalDevNoBase = import.meta.env.DEV && !ENV_BASE;

// Environment-aware base URL
const BASE = import.meta.env.DEV
  ? (ENV_BASE ? ENV_BASE.replace(/\/+$/, "") : "")          
  : (ENV_BASE ? ENV_BASE.replace(/\/+$/, "") : "/api/magento");

// Helper to join base URL + path
function joinBase(path) {
  if (!BASE) return path;
  return BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : "/" + path);
}

// ensureGuestCartId
export async function ensureGuestCartId() {
  const key = "mg_guest_cart_id";
  let id = localStorage.getItem(key);
  if (id) return id;

  if (!isLocalDevNoBase) {
    const res = await fetch("/api/magento/create-guest", { method: "POST" });
    if (!res.ok) throw new Error("Failed to create guest cart: " + (await res.text()));
    id = (await res.json())?.replace(/^"+|"+$/g, "");
    localStorage.setItem(key, id);
    return id;
  }

  const res = await fetch(joinBase("/rest/V1/guest-carts"), { method: "POST" });
  if (!res.ok) throw new Error("Failed to create guest cart: " + (await res.text()));
  id = await res.json();
  localStorage.setItem(key, id);
  return id;
}

// Add configurable product to cart (supports 3 attributes)
export async function addConfigurableToGuestCart({
  cartId,
  parentSku,
  cushionTypeId,
  fabricMaterialId, 
  sofaLegTypeId,
  qty = 1
}) {
  if (!cartId) throw new Error("Missing cartId");
  
  const cleanCartId = String(cartId).replace(/^"+|"+$/g, "");
  const cleanQty = Number(qty);

  const ENV_BASE = import.meta.env.VITE_MAGENTO_BASE ?? "";
  const isLocalDevNoBase = import.meta.env.DEV && !ENV_BASE;

  // Local Dev: Use Vite Proxy directly to Magento
  if (isLocalDevNoBase) {
    const url = joinBase(`/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items`);

    const payload = {
      cartItem: {
        quote_id: cleanCartId,
        sku: parentSku,
        qty: cleanQty,
        product_option: {
          extension_attributes: {
            configurable_item_options: [
              { option_id: 150, option_value: cushionTypeId },    // Cushion Type
              { option_id: 151, option_value: fabricMaterialId }, // Fabric Material  
              { option_id: 152, option_value: sofaLegTypeId }     // Sofa Leg Type
            ]
          }
        }
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error("Add to cart failed (local): " + txt);
    }
    return res.json();
  }

  // Production: Use serverless bridge
  const bridgeRes = await fetch("/api/magento/add-configurable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cartId: cleanCartId,
      parentSku,
      cushionTypeId,
      fabricMaterialId,
      sofaLegTypeId,
      qty: cleanQty
    })
  });

  if (!bridgeRes.ok) {
    const txt = await bridgeRes.text().catch(() => "");
    throw new Error("Add to cart (bridge) failed: " + txt);
  }
  return bridgeRes.json();
}

// Get cart items
export async function getGuestCartItems(cartId) {
  if (!cartId) throw new Error("Missing cartId");
  const clean = String(cartId).replace(/^"+|"+$/g, "");

  if (!isLocalDevNoBase) {
    const res = await fetch(`/api/magento/get-items?cartId=${encodeURIComponent(clean)}`);
    if (!res.ok) throw new Error("Failed to fetch cart items: " + (await res.text()));
    return res.json();
  }

  const url = joinBase(`/rest/V1/guest-carts/${encodeURIComponent(clean)}/items`);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch cart items: " + (await res.text()));
  return res.json();
}

// Fetch product data and prices
export async function fetchProductData() {
  try {
    const response = await fetch('http://13.203.184.96/custom-sofa-json.php?sku=UDSOFA-PARENT');
    if (!response.ok) throw new Error('Failed to fetch product data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
}