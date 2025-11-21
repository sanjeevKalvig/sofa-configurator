import React, { useState, useEffect } from 'react';
import { Grid3x3, Palette, Sofa } from "lucide-react";
import { getMaterialsByCategories } from '../config/getterMappedDatafunctions';
import { useProductPricing } from '../hooks/useProductPricing';
import styles from '../styleSheet/ToggleSwtich.module.css';

function FloatingLeftCart({ showMeasurements, setShowMeasurements }) {
  const swatches = getMaterialsByCategories();
  const { updateSelectedOption } = useProductPricing();
  const [selected, setSelected] = useState({});

  const directMapping = {
    "Cushion Type-0": { attribute: "cushion_type", optionId: 18 },
    "Cushion Type-1": { attribute: "cushion_type", optionId: 19 },
    "Cushion Type-2": { attribute: "cushion_type", optionId: 20 },
    "Fabric Material-3": { attribute: "fabric_material", optionId: 15 },
    "Fabric Material-4": { attribute: "fabric_material", optionId: 16 },
    "Fabric Material-5": { attribute: "fabric_material", optionId: 17 },
    "Sofa Leg Type-6": { attribute: "sofa_leg_type", optionId: 21 },
    "Sofa Leg Type-7": { attribute: "sofa_leg_type", optionId: 22 },
    "Sofa Leg Type-8": { attribute: "sofa_leg_type", optionId: 23 },
  };

  useEffect(() => {
    const initialSelections = {
      "Cushion Type": "0",
      "Fabric Material": "3",
      "Sofa Leg Type": "6",
    };
    setSelected(initialSelections);
  }, []);

  useEffect(() => {
    const handleMaterialChange = (e) => {
      const { category, materialId } = e.detail;
      setSelected((prev) => ({ ...prev, [category]: materialId }));
      const key = `${category}-${materialId}`;
      const mapping = directMapping[key];
      if (mapping) updateSelectedOption(mapping.attribute, mapping.optionId);
    };
    window.addEventListener("material-change", handleMaterialChange);
    return () => window.removeEventListener("material-change", handleMaterialChange);
  }, [updateSelectedOption]);

  const onMaterialClick = (category, materialId) => {
    window.dispatchEvent(new CustomEvent("material-change", { detail: { category, materialId } }));
    setSelected((prev) => ({ ...prev, [category]: materialId }));
    const key = `${category}-${materialId}`;
    const mapping = directMapping[key];
    if (mapping) updateSelectedOption(mapping.attribute, mapping.optionId);
  };

  return (
    <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-auto z-10">
      {/* Under-glow to enhance the floating illusion (lighter for white bg) */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-44 h-10 bg-emerald-400/15 blur-2xl rounded-full" />

      <div className="relative w-[280px] rounded-3xl bg-white backdrop-blur-xl border border-neutral-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-4 space-y-4 transition-transform duration-300 motion-safe:hover:-translate-y-1 text-black">
        {/* Top strap/handle */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full bg-white border border-neutral-300 shadow-sm" />

        {/* Wheels (decorative) */}
        <div className="absolute -bottom-4 left-6 w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 shadow" />
        <div className="absolute -bottom-4 right-6 w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 shadow" />

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px_2px_rgba(16,185,129,0.35)]" />
          <h2 className="text-sm font-semibold">Customize Cart</h2>
        </div>

        {/* MATERIALS */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium tracking-wide">Materials</span>
          </div>

          {swatches.map((categoryObj, i) => {
            const category = Object.keys(categoryObj)[0];
            const items = categoryObj[category];

            return (
              <div key={i} className="space-y-2">
                <h3 className="text-[11px] font-medium">{category}</h3>
                <div className="flex gap-2">
                  {items.map((mat) => {
                    const isActive = selected[category] === mat.id;
                    return (
                      <button
                        key={mat.id}
                        onClick={() => onMaterialClick(category, mat.id)}
                        className={`relative h-9 w-9 rounded-full border transition-all duration-200
                          ${isActive
                            ? "border-emerald-500 ring-2 ring-emerald-300/40 shadow-[0_0_14px_2px_rgba(16,185,129,0.25)]"
                            : "border-neutral-300 hover:border-neutral-400"
                          }
                        `}
                        style={{
                          backgroundImage: `url(${mat.imagePath})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                        aria-label={mat.materialName}
                      >
                        {/* subtle gloss suited for light theme */}
                        <span className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent mix-blend-overlay pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* SEAT CONFIG */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sofa className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium tracking-wide">Seat Config</span>
          </div>

          {/* Segmented control style */}
          <div className="flex rounded-xl overflow-hidden border border-neutral-200 bg-white">
            {["Left", "Right"].map((label, idx) => (
              <button
                key={label}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-medium transition-colors
                  ${idx === 0 ? "border-r border-neutral-200" : ""}
                  hover:bg-neutral-100 active:bg-neutral-200
                `}
              >
                <Sofa className="h-3 w-3 text-emerald-500" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* MEASUREMENTS TOGGLE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Grid3x3 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs">Measurements</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={showMeasurements}
              onChange={(e) => setShowMeasurements(e.target.checked)}
            />
            <span className={`${styles.slider} ${styles.round}`}></span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-center pt-2 border-t border-neutral-200">
          <span className="text-[10px]">Material & Layout</span>
        </div>
      </div>
    </div>
  );
}

export default FloatingLeftCart;