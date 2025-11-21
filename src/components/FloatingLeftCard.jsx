import React, { useState, useEffect } from 'react'
import { Grid3x3, Palette, Sofa } from "lucide-react";
import { getMaterialsByCategories } from '../config/getterMappedDatafunctions';
import styles from '../styleSheet/ToggleSwtich.module.css';

function FloatingLeftCard({showMeasurements, setShowMeasurements}) {
  const swatches = getMaterialsByCategories();
  console.log(swatches)

  // UI state for which material is selected per category
  const [selected, setSelected] = useState({});

  // Listen for material-change coming from Model.jsx
  useEffect(() => {
    function onMaterialChange(e) {
      const { category, materialId } = e.detail;
      setSelected((prev) => ({
        ...prev,
        [category]: materialId
      }));
    }
    window.addEventListener("material-change", onMaterialChange);
    return () => window.removeEventListener("material-change", onMaterialChange);
  }, []);

  function onMaterialClick(category, materialId) {
    window.dispatchEvent(
      new CustomEvent("material-change", {
        detail: { category, materialId }
      })
    );

    // Update UI highlight instantly
    setSelected((prev) => ({
      ...prev,
      [category]: materialId
    }));
  }

  return (
    <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-auto z-10">
      <div className="w-72 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl shadow-xl p-4 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
          <h2 className="text-sm font-semibold text-slate-100">Customize</h2>
        </div>

        {/* MATERIAL SECTION */}
        <section>
          <div className="mb-3 flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-slate-300" />
            <span className="text-xs font-medium tracking-wider text-slate-300">MATERIAL</span>
          </div>

          <div className="flex flex-col gap-4">
            {swatches.map((categoryObj, i) => {
              const category = Object.keys(categoryObj)[0];
              const items = categoryObj[category];

              return (
                <div key={i} className="flex flex-col gap-2">
                  <h1 className="text-slate-200 text-xs font-medium">{category}</h1>

                  <div className="flex gap-3">
                    {items.map((mat) => {
                      const isActive = selected[category] === mat.id;

                      return (
                        <button
                          key={mat.id}
                          onClick={() => onMaterialClick(category, mat.id)}
                          className={`relative h-8 w-8 rounded-lg border transition hover:brightness-110
                            ${isActive ? "ring-2 ring-blue-400 border-blue-300" : "border-white/20"}
                          `}
                          style={{
                            backgroundImage: `url(${mat.imagePath})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                          aria-label={`Material ${mat.materialName}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEAT CONFIG SECTION */}
        <section>
          <div className="mb-3 flex items-center gap-1.5">
            <Sofa className="h-4 w-4 text-slate-300" />
            <span className="text-xs font-medium tracking-wider text-slate-300">SEAT CONFIG</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "left", label: "Left" },
              { id: "right", label: "Right" },
            ].map((opt) => (
              <button
                key={opt.id}
                className="flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition"
              >
                <Sofa className="h-3 w-3" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Measurement Toggle button section*/}
        <div className="mb-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white text-[10px]">
                <Grid3x3 className="h-3 w-3 opacity-80" />
                <span>MEASUREMENTS</span>
            </div>
            <label
                className={styles.switch}>
                <input
                    type="checkbox"
                    checked={showMeasurements}
                    onChange={(e) => setShowMeasurements(e.target.checked)}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-500">Material & Layout</span>
        </div>
      </div>
    </div>
  );
}

export default FloatingLeftCard;
