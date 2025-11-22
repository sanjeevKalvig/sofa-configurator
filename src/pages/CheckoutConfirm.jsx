import React, { useEffect, useState } from "react";
import { getGuestCartItems } from "../lib/magento";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Checkout Confirm
 * - Shows final order summary and saved shipping details
 * - Button "Complete Order (Host)" keeps flow on your site (placeholder)
 * - Button "Pay with Magento" will redirect to Magento attach/checkout (optional)
 */

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CheckoutConfirm() {
  const query = useQuery();
  const cartId = query.get("cartId");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (cartId) {
          const its = await getGuestCartItems(cartId);
          setItems(Array.isArray(its) ? its : []);
        }
        const draft = JSON.parse(localStorage.getItem("checkout_draft_customer") || "null");
        setCustomer(draft);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [cartId]);

  function calcTotals() {
    let subtotal = 0;
    items.forEach((it) => (subtotal += (Number(it.price || 0) * Number(it.qty || 0))));
    return { subtotal };
  }

  const { subtotal } = calcTotals();

  const handleBack = () => navigate(-1);

  const handleCompleteOnSite = async () => {
    // TODO: implement your own backend order creation here.
    // This button represents finalizing the order within your own system.
    alert("Order would be created on your site (implement server-side).");
  };

  const handlePayWithMagento = () => {
    // OPTIONAL: If you want to send the user to Magento attach/checkout,
    // implement server-side attach logic and redirect here.
    // Placeholder redirect (replace with your own domain / attach endpoint if you implement it).
    if (!cartId) return alert("Cart missing");
    const magentoCheckout = `http://13.203.184.96/checkout/?cartId=${encodeURIComponent(cartId)}`;
    // If you prefer to call an attach API on your server, call it here and then redirect.
    window.location.href = magentoCheckout;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-slate-500">Loading order...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Confirm your order</h2>
          <div>
            <button onClick={handleBack} className="text-sm text-gray-600">← Back</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="border rounded p-4">
              <h4 className="font-medium mb-2">Shipping</h4>
              {customer ? (
                <div className="text-sm text-gray-700">
                  <div>{customer.name}</div>
                  <div>{customer.email} • {customer.phone}</div>
                  <div className="mt-2">{customer.address}</div>
                </div>
              ) : <div className="text-sm text-gray-500">No shipping info saved</div>}
            </div>

            <div className="border rounded p-4">
              <h4 className="font-medium mb-2">Items</h4>
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">No items</div>
              ) : (
                <ul className="space-y-3">
                  {items.map(it => (
                    <li key={it.item_id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{it.name || it.sku}</div>
                        <div className="text-sm text-gray-500">Qty: {it.qty}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹ {(Number(it.price || 0) * Number(it.qty || 0)).toLocaleString("en-IN")}</div>
                        <div className="text-xs text-gray-400">₹ {Number(it.price || 0).toLocaleString("en-IN")} each</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border rounded p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>₹ {Number(subtotal).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Shipping</span>
                <span>Calculated later</span>
              </div>

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹ {Number(subtotal).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={handleCompleteOnSite} className="w-full py-3 bg-green-600 text-white rounded">Complete Order (Host)</button>
              <button onClick={handlePayWithMagento} className="w-full py-3 bg-blue-600 text-white rounded">Pay with Magento</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
