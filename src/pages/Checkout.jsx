import React, { useEffect, useState } from "react";
import {
  ensureGuestCartId,
  getGuestCartItems,
  updateGuestCartItem,
  removeGuestCartItem,
} from "../lib/magento";
import { useNavigate } from "react-router-dom";

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

    try {
      localStorage.setItem("checkout_draft_customer", JSON.stringify(customer));
    } catch {}

    navigate(`/checkout/confirm?cartId=${encodeURIComponent(cartId)}`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-checkout-bg flex items-center justify-center p-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl max-w-md w-full text-center border border-white/20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-700">Loading your cart...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-checkout-bg flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h3>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button 
            onClick={refreshItems} 
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-base hover:bg-emerald-600 transition-all duration-200 shadow"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 mb-3">Checkout</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">Review your order and enter your shipping details</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Main Content - Cart Items (left, larger) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md border border-white/40 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-gray-900">Your Cart ({items.length})</h2>
                {items.length > 0 && (
                  <button
                    onClick={refreshItems}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Refresh
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5M7 13l1.5 4.5M20 7H7M3 3h18M16 13h2a1 1 0 001-1V9a1 1 0 00-1-1h-2v6z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">Your cart is empty</h3>
                  <p className="text-sm text-gray-600">No items to checkout</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it.item_id} className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow transition-all duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-semibold text-gray-600">{it.sku?.charAt(0) || 'I'}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{it.name || it.sku}</h4>
                            <p className="text-xs text-gray-600 mt-1">SKU: {it.sku}</p>
                            {it.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{it.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 ml-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₹{Number(it.price || 0).toLocaleString("en-IN")}</div>
                            <div className="text-xs text-gray-600">Qty: {it.qty} ×</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white px-2 py-1 border border-gray-200 rounded-lg shadow-sm">
                              <button
                                onClick={() => handleQtyChange(it.item_id, Number(it.qty || 0) - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-all"
                                disabled={processing}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={it.qty}
                                onChange={(e) => handleQtyChange(it.item_id, Number(e.target.value))}
                                className="w-12 px-1 py-0.5 border-0 text-center font-semibold text-sm bg-transparent focus:outline-none"
                                disabled={processing}
                              />
                              <button
                                onClick={() => handleQtyChange(it.item_id, Number(it.qty || 0) + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-all"
                                disabled={processing}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(it.item_id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                              disabled={processing}
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtotal Card */}
              {items.length > 0 && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 mt-6 text-sm">
                  <div className="flex justify-between items-center font-semibold text-gray-900">
                    <span>Cart Subtotal</span>
                    <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* (Left side) - we removed the large Shipping form from here to keep layout compact */}
          </div>

          {/* Right Column - Order Summary + Compact Green Shipping (smaller) */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-white/50 p-6 sticky top-8 h-fit">
              <h4 className="text-xl font-light text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h4>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-gray-900">₹{Number(subtotal).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Estimated Total</span>
                  <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={processing || items.length === 0 || !cartId}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg text-sm font-semibold shadow hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Continue to Payment"
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-center text-gray-500">
                Secure checkout • No payment details required yet
              </div>
            </div>

            {/* Compact Single Green Shipping Card placed on the right side. Small text, smaller inputs, scrollable if long. */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm shadow-sm max-h-64 overflow-auto sticky top-8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-emerald-800">Shipping Details</h3>
                </div>
              </div>

              {/* Compact form (kept in single green card). Inputs are smaller to reduce visual weight. */}
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-700">Full Name *</label>
                  <input
                    value={customer.name}
                    onChange={(e) => handleInput("name", e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700">Email *</label>
                    <input
                      value={customer.email}
                      onChange={(e) => handleInput("email", e.target.value)}
                      type="email"
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-emerald-700">Phone *</label>
                    <input
                      value={customer.phone}
                      onChange={(e) => handleInput("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-700">Shipping Address *</label>
                  <textarea
                    value={customer.address}
                    onChange={(e) => handleInput("address", e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all resize-vertical"
                    placeholder="Enter your complete shipping address"
                  />
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleProceed}
                    disabled={processing || items.length === 0 || !cartId}
                    className="w-full bg-emerald-600 text-white py-2 rounded-md text-sm font-medium shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
