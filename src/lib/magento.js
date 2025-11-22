// Use relative paths - Vite will proxy them to Magento
const isLocalDevNoBase = true; // Always use local dev with proxy

// Helper to join base URL + path
function joinBase(path) {
  // Use relative path - Vite will proxy to Magento
  return path.startsWith("/") ? path : "/" + path;
}

// ensureGuestCartId
export async function ensureGuestCartId() {
  const key = "mg_guest_cart_id";
  let id = localStorage.getItem(key);
  if (id) {
    console.log('Found existing cart ID:', id);
    return id;
  }

  console.log('Creating new guest cart via Vite proxy...');
  
  const url = joinBase("/rest/V1/guest-carts");
  console.log('Cart creation URL:', url);
  
  const res = await fetch(url, { 
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  console.log('Cart creation response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Cart creation failed:', errorText);
    throw new Error("Failed to create guest cart: " + errorText);
  }
  
  id = await res.json();
  console.log('Cart created successfully:', id);
  localStorage.setItem(key, id);
  return id;
}

// Add configurable product to cart (using child SKU approach)
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
  const url = joinBase(`/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items`);

  // --- CONFIGURABLE PAYLOAD (preferred) ---
  // NOTE: option_id values MUST match Magento attribute IDs (e.g. 150,151,152)
  // option_value values are the option IDs from your custom-sofa-json (e.g. 18,15,21)
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

  // --- CHILD SKU payload FALLBACK (your current approach) ---
  const optionLabels = {
    cushion_type: { 18: "Comfort Foam", 19: "Feather Touch", 20: "Memory Cloud" },
    fabric_material: { 15: "Premium Leather", 16: "Soft Fabric", 17: "Royal Velvet" },
    sofa_leg_type: { 21: "Modern Steel", 22: "Wooden Classic", 23: "Black Metal" }
  };
  const cushionLabel = optionLabels.cushion_type[cushionTypeId];
  const fabricLabel = optionLabels.fabric_material[fabricMaterialId];
  const legLabel = optionLabels.sofa_leg_type[sofaLegTypeId];
  const childSku = cushionLabel && fabricLabel && legLabel
    ? `UDSOFA-PARENT-${cushionLabel}-${fabricLabel}-${legLabel}`
    : null;

  const childPayload = childSku ? {
    cartItem: { sku: childSku, qty: cleanQty, quote_id: cleanCartId }
  } : null;

  console.log("Attempting configurable add (parent sku) -> payload:", configurablePayload);

  // Try configurable approach first
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(configurablePayload)
    });

    const text = await res.text();
    console.log("Magento configurable add response:", res.status, text);

    if (res.ok) {
      try { return JSON.parse(text); } catch (e) { return text; }
    } else {
      // If Magento returned 4xx/5xx, fall back to child SKU (if available)
      console.warn("Configurable add failed, will try child-SKU fallback. Magento said:", res.status, text);
      if (!childPayload) throw new Error(`Configurable add failed and child SKU not available: ${res.status} - ${text}`);
    }
  } catch (err) {
    // network / unexpected errors: fallback
    console.warn("Configurable add request error, falling back to child-SKU approach:", err);
  }

  // --- FALLBACK to child SKU (existing behaviour) ---
  if (!childPayload) throw new Error("Cannot add to cart: neither configurable payload succeeded nor child SKU is available.");

  console.log("Falling back to child-SKU add -> payload:", childPayload);
  const res2 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(childPayload)
  });
  const txt2 = await res2.text();
  console.log("Child SKU add response:", res2.status, txt2);
  if (!res2.ok) throw new Error(`Child SKU add failed: ${res2.status} - ${txt2}`);
  try { return JSON.parse(txt2); } catch (e) { return txt2; }
}


// Get cart items
export async function getGuestCartItems(cartId) {
  if (!cartId) throw new Error("Missing cartId");
  const clean = String(cartId).replace(/^"+|"+$/g, "");

  console.log('GET CART ITEMS - Via Vite Proxy');
  const url = joinBase(`/rest/V1/guest-carts/${encodeURIComponent(clean)}/items`);
  console.log('Get cart items URL (relative):', url);
  
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Get cart items response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Get cart items failed:', errorText);
    throw new Error("Failed to fetch cart items: " + errorText);
  }
  
  const result = await res.json();
  console.log('Get cart items success, count:', result.length);
  return result;
}

// UPDATE ITEM
export async function updateGuestCartItem(cartId, itemId, qty) {
  if (!cartId) throw new Error("Missing cartId");
  if (!itemId) throw new Error("Missing itemId");
  if (qty === undefined || qty === null) throw new Error("Missing qty");

  const cleanCartId = String(cartId).replace(/^"+|"+$/g, "");
  const cleanItemId = Number(itemId);
  const cleanQty = Number(qty);

  console.log('UPDATE ITEM - Via Vite Proxy');
  const url = joinBase(`/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items/${encodeURIComponent(cleanItemId)}`);
  
  const payload = { 
    cartItem: { 
      item_id: cleanItemId, 
      qty: cleanQty, 
      quote_id: cleanCartId 
    } 
  };
  
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) throw new Error("Failed to update cart item: " + (await res.text().catch(() => "")));
  return res.json();
}

// REMOVE ITEM
export async function removeGuestCartItem(cartId, itemId) {
  if (!cartId) throw new Error("Missing cartId");
  if (!itemId) throw new Error("Missing itemId");

  const cleanCartId = String(cartId).replace(/^"+|"+$/g, "");
  const cleanItemId = Number(itemId);

  console.log('REMOVE ITEM - Via Vite Proxy');
  const url = joinBase(`/rest/V1/guest-carts/${encodeURIComponent(cleanCartId)}/items/${encodeURIComponent(cleanItemId)}`);
  
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove cart item: " + (await res.text().catch(() => "")));
  return res.json();
}

// Fetch product data and prices
export async function fetchProductData() {
  try {
    console.log('Fetching product data via Vite proxy...');
    const response = await fetch('/custom-sofa-json.php?sku=UDSOFA-PARENT');
    if (!response.ok) throw new Error('Failed to fetch product data');
    const data = await response.json();
    console.log('Product data loaded successfully');
    return data;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
}