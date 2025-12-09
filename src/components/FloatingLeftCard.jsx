import React, { useState, useEffect } from 'react';
import { Grid3x3, Palette, Sofa, ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { getMaterialsByCategories } from '../config/getterMappedDatafunctions';
import { useProductPricing } from '../hooks/useProductPricing';
import styles from '../stylesheet/ToggleSwtich.module.css';

function FloatingLeftCart({ showMeasurements, setShowMeasurements, setActiveMaterial, setCategorySelectedMaterial, clickedMeshCategory, setClickedMeshCategory }) {
  const swatches = getMaterialsByCategories();
  const { updateSelectedOption, selectedOptions } = useProductPricing();
  const [selected, setSelected] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const onMaterialClick = (category, materialId, materialName) => {
    if (clickedMeshCategory == category) {
      setActiveMaterial({ materialId: materialId, materialName: materialName });
    }
    setCategorySelectedMaterial((prevDetail) => ({
      ...prevDetail,
      [category]: { materialId: materialId, materialName: materialName }
    }))
    window.dispatchEvent(new CustomEvent("material-change", { detail: { category, materialId } }));
    setSelected((prev) => ({ ...prev, [category]: materialId }));
    const key = `${category}-${materialId}`;
    const mapping = directMapping[key];
    if (mapping) updateSelectedOption(mapping.attribute, mapping.optionId);
  };

  const toggleExpand = () => {
    if (isCollapsed) {
      setIsExpanded(true);
      setIsCollapsed(false);
    } else if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const handleCollapse = () => {
    setIsCollapsed(true);
    setIsExpanded(false);
  };

  // Check if all options are selected
  const isConfigurationComplete = () => {
    return Object.values(selected).every(val => val !== undefined);
  };

  return (
    <>
      {/* Enhanced Collapsed State with Icons and Animated Border */}
      {(isCollapsed || (!isCollapsed && !isExpanded)) && (
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-auto z-10 cursor-pointer group"
          onClick={toggleExpand}
        >
          <div className="relative">
            {/* Main Container with Animated Border */}
            <div className="relative w-12 h-[8rem] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 flex flex-col items-center justify-between py-3 overflow-hidden ">

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl p-[2px]">
                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 animate-spin-slow opacity-70"></div>
              </div>

              {/* Inner Background */}
              <div className="absolute inset-[2px] bg-white/95 rounded-2xl backdrop-blur-sm z-0"></div>

              {/* Top Icon - Materials */}
              <div className="relative z-10 p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Palette className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Middle Icon - Measurements */}
              <div className="relative z-10 p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Grid3x3 className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Bottom Icon - Expand */}
              <div className="relative z-10 p-1.5 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Completion Status Dot */}
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full z-20 ${isConfigurationComplete()
                  ? 'bg-emerald-500 shadow-[0_0_6px_1px_rgba(16,185,129,0.6)]'
                  : 'bg-amber-500 shadow-[0_0_6px_1px_rgba(245,158,11,0.6)] animate-pulse'
                }`} />

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            </div>

            {/* Enhanced Tooltip */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
              <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-2xl border border-gray-700/50 min-w-[140px]">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  Customize
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3 text-emerald-400" />
                    <span>Materials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="w-3 h-3 text-blue-400" />
                    <span>Measurements</span>
                  </div>
                </div>
                <div className="text-xs text-cyan-300 mt-2 font-medium flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  Click to expand
                </div>
              </div>
            </div>
          </div>

          {/* Custom CSS for slow spin animation */}
          <style jsx>{`
            @keyframes slow-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
              animation: slow-spin 8s linear infinite;
            }
          `}</style>
        </div>
      )}

      {/* Expanded Card (Keep your excellent expanded design) */}
      {isExpanded && (
        <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-auto z-10">
          {/* Enhanced under-glow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-40 h-8 bg-gradient-to-t from-emerald-400/20 to-transparent blur-2xl rounded-full" />

          <div className="relative w-[240px] rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200/80 shadow-2xl p-4 space-y-4 transition-all duration-300 motion-safe:hover:shadow-2xl text-black">
            {/* Enhanced Close/Collapse button */}
            <button
              onClick={handleCollapse}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border border-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all duration-200 z-20 group/close"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 transition-transform group-hover/close:-translate-x-0.5" />
            </button>

            {/* Enhanced top strap/handle */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-gradient-to-r from-gray-300 to-gray-200 border border-gray-300/50 shadow-sm" />

            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(16,185,129,0.3)]" />
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                </div>
                <h2 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Customize
                </h2>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${isConfigurationComplete() ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {isConfigurationComplete() ? 'Complete' : 'Incomplete'}
              </div>
            </div>

            {/* Enhanced MATERIALS Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Palette className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Materials
                </span>
              </div>

              {swatches.map((categoryObj, i) => {
                const category = Object.keys(categoryObj)[0];
                const items = categoryObj[category];
                const isCategoryComplete = selected[category] !== undefined;

                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        {category}
                        {isCategoryComplete && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        )}
                      </h3>
                      {!isCategoryComplete && (
                        <span className="text-[10px] text-amber-600 font-medium">Required</span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {items.map((mat) => {
                        const isActive = selected[category] === mat.id;
                        return (
                          <button
                            key={mat.id}
                            onClick={() => onMaterialClick(category, mat.id, mat.materialName)}
                            className={`relative h-8 w-8 rounded-full border-2 transition-all duration-200 group/button
                              ${isActive
                                ? "border-emerald-500 ring-2 ring-emerald-200 shadow-lg scale-110"
                                : "border-gray-300 hover:border-gray-400 hover:scale-105"
                              }
                            `}
                            style={{
                              backgroundImage: `url(${mat.imagePath})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                            aria-label={mat.materialName}
                          >
                            {/* Hover overlay */}
                            <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity duration-200 pointer-events-none" />

                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Enhanced SEAT CONFIG Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                  <Sofa className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Seat Config
                </span>
              </div>

              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                {["Left", "Right"].map((label, idx) => (
                  <button
                    key={label}
                    className={`flex-1 flex items-center justify-center gap-2 h-8 text-xs font-semibold transition-all duration-200
                      ${idx === 0 ? "border-r border-gray-200" : ""}
                      hover:bg-gray-50 active:bg-gray-100 hover:scale-105
                    `}
                  >
                    <Sofa className="h-3 w-3 text-blue-500" />
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {/* Enhanced MEASUREMENTS TOGGLE */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                  <Grid3x3 className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">Measurements</span>
                  <span className="text-[10px] text-gray-500">Show dimensions</span>
                </div>
              </div>
              <label className={styles.switch} style={{ transform: 'scale(0.9)' }}>
                <input
                  type="checkbox"
                  checked={showMeasurements}
                  onChange={(e) => setShowMeasurements(e.target.checked)}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>

            {/* Enhanced Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Material & Layout</span>
              <div className="text-xs text-gray-400">
                Click ← to minimize
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingLeftCart;