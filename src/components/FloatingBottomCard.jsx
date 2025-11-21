import React, { useState } from 'react'
import { ShoppingCart, Minus, Plus } from "lucide-react";
 
function FloatingBottomCard() {
    const [quantity, setQuantity] = useState(1);
 
    const handleIncrement = () => setQuantity(quantity + 1);
    const handleDecrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };
 
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
            <div className="w-[560px] rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl shadow-xl p-4">
               
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-blue-400">₹ 2,499</p>
                        <p className="text-xs text-slate-400 line-through">MRP ₹ 4,999</p>
                        <span className="text-xs font-semibold text-red-400">50% Off</span>
                    </div>
 
                    <div className="flex items-center gap-2 border border-slate-300 rounded-lg">
                        <button
                            onClick={handleDecrement}
                            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:bg-slate-100"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-800">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:bg-slate-100"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
 
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-6 py-2 text-sm font-medium text-white transition active:scale-95">
                        <span>Add to Cart</span>
                        <ShoppingCart className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
 
export default FloatingBottomCard;