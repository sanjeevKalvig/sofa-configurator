import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { ensureGuestCartId, addConfigurableToGuestCart } from "../lib/magento";
import { useProductPricing } from "../hooks/useProductPricing";
import { useCart } from "../context/CartContext";

function FloatingBottomCard() {
  const [addingToCart, setAddingToCart] = useState(false);
  const {
    currentPrice,
    selectedOptions,
    findCurrentVariant,
    loading,
    isSelectionComplete,
  } = useProductPricing();
  const { refreshCart, cartCount } = useCart();

  const handleAddToCart = async () => {
    if (loading || addingToCart || !isSelectionComplete()) return;
    setAddingToCart(true);
    try {
      const cartId = await ensureGuestCartId();
      const variant = findCurrentVariant();
      if (!variant) return alert("Combination unavailable.");
      await addConfigurableToGuestCart({
        cartId,
        parentSku: "UDSOFA-PARENT",
        cushionTypeId: selectedOptions.cushion_type,
        fabricMaterialId: selectedOptions.fabric_material,
        sofaLegTypeId: selectedOptions.sofa_leg_type,
        qty: 1,
      });
      await refreshCart();
    } catch {
      alert("Add to cart failed.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = () =>
    ensureGuestCartId().then((id) => {
      window.location.href = "/checkout";
    });

  if (loading)
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="w-[400px] h-20 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-300 text-sm">
          Loading…
        </div>
      </div>
    );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      <div className="w-[400px] h-20 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center px-5 gap-4 text-white">
        {/* Price */}
        <div className="font-bold text-cyan-400">₹{currentPrice.toLocaleString("en-IN")}</div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || !isSelectionComplete()}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold h-10"
        >
          {addingToCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>{cartCount > 0 ? `${cartCount}` : "Add"}</span>
            </>
          )}
        </button>

        {/* Checkout */}
        <button
          onClick={handleCheckout}
          className="flex-shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-4 h-10"
        >
          Checkout →
        </button>
      </div>

      {/* Incomplete banner */}
      {!isSelectionComplete() && (
        <div className="mt-2 px-3 py-1.5 bg-amber-900/50 border border-amber-700/50 rounded-full text-xs text-amber-200 text-center">
          Select Cushion, Fabric & Legs
        </div>
      )}
    </div>
  );
}

export default FloatingBottomCard;