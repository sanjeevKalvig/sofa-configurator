import React, { useEffect, useState } from "react";
import {
  ensureGuestCartId,
  getGuestCartItems,
  updateGuestCartItem,
  removeGuestCartItem,
} from "../lib/magento";
import { useNavigate } from "react-router-dom";

/**
 * Checkout page
 * - Loads guest cart items
 * - Update qty / remove item (uses existing lib functions)
 * - Collects minimal shipping info and persists it to localStorage
 * - On "Proceed" navigates to /checkout/confirm with cartId and saves shipping draft
 */

export default function Checkout() {
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const id = await ensureGuestCartId();
        setCartId(id);
        const its = await getGuestCartItems(id);
        setItems(Array.isArray(its) ? its : []);
        // restore customer draft if exists
        try {
          const draft = JSON.parse(localStorage.getItem("checkout_draft") || "null");
          if (draft) setCustomer((s) => ({ ...s, ...draft }));
        } catch {}
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshItems = async () => {
    if (!cartId) return;
    setLoading(true);
    try {
      const its = await getGuestCartItems(cartId);
      setItems(Array.isArray(its) ? its : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to refresh cart");
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    setProcessing(true);
    try {
      await updateGuestCartItem(cartId, itemId, Number(newQty));
      await refreshItems();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update qty");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = async (itemId) => {
    if (!confirm("Remove this item from cart?")) return;
    setProcessing(true);
    try {
      await removeGuestCartItem(cartId, itemId);
      await refreshItems();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to remove item");
    } finally {
      setProcessing(false);
    }
  };

  function calculateTotals() {
    let subtotal = 0;
    for (const it of items) {
      const price = Number(it.price || it.product?.price || 0);
      const qty = Number(it.qty || 0);
      subtotal += price * qty;
    }
    return { subtotal };
  }

  const { subtotal } = calculateTotals();

  const handleInput = (field, value) => {
    setCustomer((s) => {
      const next = { ...s, [field]: value };
      try {
        localStorage.setItem("checkout_draft", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const validateCustomer = () => {
    if (!customer.name.trim()) return "Please enter full name";
    if (!customer.email.trim() || !/^\S+@\S+\.\S+$/.test(customer.email)) return "Invalid email";
    if (!customer.phone.trim() || customer.phone.trim().length < 6) return "Invalid phone";
    if (!customer.address.trim()) return "Please enter shipping address";
    return null;
  };

  const handleProceed = async () => {
    const v = validateCustomer();
    if (v) return alert(v);
    if (!cartId) return alert("Cart not ready");

    // Save draft (so confirm page can read it)
    try {
      localStorage.setItem("checkout_draft_customer", JSON.stringify(customer));
    } catch {}

    // Navigate to confirm page with cartId
    navigate(`/checkout/confirm?cartId=${encodeURIComponent(cartId)}`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500">Loading cart...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-8 shadow max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={refreshItems} className="px-4 py-2 bg-blue-600 text-white rounded">
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Cart ({items.length})</h2>

          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Your cart is empty.
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li key={it.item_id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex items-center justify-center text-xs">
                      {/* If image exists show thumbnail */}
                      {it.product && it.product.small_image ? (
                        <img src={it.product.small_image} alt={it.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{it.name || it.sku}</div>
                      <div className="text-xs text-gray-500">SKU: {it.sku}</div>
                      <div className="text-xs text-gray-500 mt-1">{it.description || ""}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">₹ {Number(it.price || 0).toLocaleString("en-IN")}</div>
                      <div className="text-sm text-gray-500">Total: ₹ {(Number(it.price || 0) * Number(it.qty || 0)).toLocaleString("en-IN")}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={(e) => handleQtyChange(it.item_id, Number(e.target.value))}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                      <button onClick={() => handleRemove(it.item_id)} className="text-red-600 text-sm">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar: Shipping & Summary */}
        <aside className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold">Shipping Details</h3>

          <label className="block text-sm">
            Full name
            <input value={customer.name} onChange={(e) => handleInput("name", e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </label>

          <label className="block text-sm">
            Email
            <input value={customer.email} onChange={(e) => handleInput("email", e.target.value)} type="email" className="mt-1 w-full border px-3 py-2 rounded" />
          </label>

          <label className="block text-sm">
            Phone
            <input value={customer.phone} onChange={(e) => handleInput("phone", e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </label>

          <label className="block text-sm">
            Address
            <textarea value={customer.address} onChange={(e) => handleInput("address", e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" rows="3" />
          </label>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹ {Number(subtotal).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>

            <div className="flex justify-between font-semibold mt-4">
              <span>Estimated Total</span>
              <span>₹ {Number(subtotal).toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-4 space-y-2">
              <button onClick={handleProceed} disabled={processing || items.length === 0} className="w-full py-3 bg-blue-600 text-white rounded">
                Proceed
              </button>

              <button onClick={refreshItems} className="w-full py-2 border rounded text-sm">
                Refresh Cart
              </button>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
