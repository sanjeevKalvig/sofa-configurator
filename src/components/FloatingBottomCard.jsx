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
    ensureGuestCartId().then(() => {
      window.location.href = "/checkout";
    });

  const completionProgress = () => {
    const total = 3;
    const completed = Object.values(selectedOptions).filter(Boolean).length;
    return (completed / total) * 100;
  };

  if (loading)
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="w-[480px] h-20 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700 font-medium">Loading options...</span>
        </div>
      </div>
    );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[480px]">
      {/* Progress Strip (integrated) */}
      {!isSelectionComplete() && (
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
            style={{ width: `${completionProgress()}%` }}
          />
        </div>
      )}

      {/* Modern Glass‑Morphic Panel */}
      <div className="
        h-20 
        w-full 
        bg-white/60 backdrop-blur-lg 
        border border-white/30 
        shadow-lg 
        rounded-3xl 
        flex items-center 
        px-6 gap-5
      ">
        {/* Price Section */}
        <div className="flex flex-col justify-center min-w-[100px]">
          <span className="font-mono text-2xl font-bold text-gray-900">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">
            Total
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || !isSelectionComplete()}
          className="
            flex-1 h-14 rounded-xl 
            bg-gradient-to-r from-emerald-500 to-emerald-600 
            text-white font-medium 
            shadow-lg 
            flex items-center justify-center gap-2
            transition-all 
            hover:from-emerald-600 hover:to-emerald-700 
            active:scale-[0.98] 
            disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100
          "
        >
          {addingToCart ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add {cartCount > 0 && `(${cartCount})`}
            </>
          )}
        </button>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!isSelectionComplete() || cartCount === 0}
          className="
            h-14 px-6 rounded-xl 
            bg-gray-900 text-white font-bold 
            shadow-lg 
            hover:bg-black 
            active:scale-[0.98] 
            disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100
          "
        >
          Checkout →
        </button>
      </div>
    </div>
  );
}

export default FloatingBottomCard;