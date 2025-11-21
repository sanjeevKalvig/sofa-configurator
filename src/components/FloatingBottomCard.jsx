import React, { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { ensureGuestCartId, addConfigurableToGuestCart } from "../lib/magento";
import { useProductPricing } from "../hooks/useProductPricing";

function FloatingBottomCard() {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const {
    currentPrice,
    selectedOptions,
    selectedOptionLabels,
    findCurrentVariant,
    loading,
    isSelectionComplete,
    getSelectedCombinationText,
  } = useProductPricing();

  const handleIncrement = () => setQuantity(quantity + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = async () => {
    if (loading || addingToCart) return;

    try {
      setAddingToCart(true);

      if (!isSelectionComplete()) {
        alert(
          "Please select all material options (Cushion, Fabric, and Legs) before adding to cart."
        );
        return;
      }

      const cartId = await ensureGuestCartId();
      const variant = findCurrentVariant();

      if (!variant) {
        alert(
          "Selected combination not available. Please try different materials."
        );
        return;
      }

      await addConfigurableToGuestCart({
        cartId,
        parentSku: "UDSOFA-PARENT",
        cushionTypeId: selectedOptions.cushion_type,
        fabricMaterialId: selectedOptions.fabric_material,
        sofaLegTypeId: selectedOptions.sofa_leg_type,
        qty: quantity,
      });

      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Failed to add to cart: " + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
        <div className="w-[560px] rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl shadow-xl p-2">
          <div className="flex items-center justify-center">
            <p className="text-slate-400 text-xs">Loading prices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
      <div className="w-[560px] rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl shadow-xl p-2">
        <div className="flex items-center justify-between gap-4">
          {/* Price & Selection */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-lg font-bold text-blue-400 flex-shrink-0">
              ₹ {currentPrice.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-300 truncate hidden sm:block">
              {getSelectedCombinationText()}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !isSelectionComplete()}
              className="flex items-center justify-center gap-1 rounded-md bg-red-500 hover:bg-red-600 px-3 py-2 text-xs font-medium text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selection Warning */}
        {!isSelectionComplete() && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-amber-400 bg-black/50 px-2 py-0.5 rounded-full whitespace-nowrap">
            Select Cushion, Fabric & Legs
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingBottomCard;
