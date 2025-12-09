import React, { useEffect, useMemo, useState } from "react";
import { data } from "../config/data";
import { getMaterialsByCategories } from "../config/getterMappedDatafunctions";

const swatches = getMaterialsByCategories();

function MaterialPicker({ clickedMeshCategory,activeMaterial, setActiveMaterial,categorySelectedMaterial,setCategorySelectedMaterial }) {
  if (!clickedMeshCategory) return null;

  const [hover, setHover] = useState(null);
  const [materials,setMaterials]=useState([])

  useEffect(() => {
    const things = swatches.find((categoryObj, i) => {
      const category = Object.keys(categoryObj)[0];
      return clickedMeshCategory == category;
    })
    if (things) {
      setMaterials(Object.values(things)[0])
    }
  }, [clickedMeshCategory])


  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      {/* Glass container */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-center gap-6">
          {materials.map((mat) => {
            const isHovered = hover === mat.id;
            const imageUrl = mat?.imagePath || "";

            return (
              <div
                key={mat.id}
                className="relative group"
                style={{ perspective: '1000px' }}
              >
                <button
                  onClick={() => {
                    setActiveMaterial({materialId:mat.id,materialName:mat.materialName});
                    setCategorySelectedMaterial((prevDetail)=>({
                      ...prevDetail,
                      [clickedMeshCategory]:{materialId:mat.id,materialName:mat.materialName}
                    }))
                    window.dispatchEvent(
                      new CustomEvent("material-change", {
                        detail: { category: clickedMeshCategory, materialId: mat.id },
                      })
                    );
                  }}
                  onMouseEnter={() => setHover(mat.id)}
                  onMouseLeave={() => setHover(null)}
                  className="relative block cursor-pointer" // ✅ Added cursor-pointer
                >
                  {/* 3D Sphere with pure CSS */}
                  <div
                    className={`
                        w-28 h-28 rounded-full 
                        transition-all duration-300
                        ${isHovered ? 'scale-110' : 'scale-100'}
                      `}
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: `
                          inset -10px -10px 30px rgba(0,0,0,0.35),
                          inset 10px 10px 30px rgba(255,255,255,0.5),
                          ${isHovered
                          ? '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(16,185,129,0.4)'
                          : '0 10px 30px rgba(0,0,0,0.2)'
                        }
                        `,
                      border: activeMaterial?.materialId === mat.id ? "6px solid white" : "",
                      transformStyle: 'preserve-3d',
                      animation: isHovered ? 'spinSphere 4s linear infinite' : 'none',
                    }}
                  >
                    {/* Glossy highlight */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 30%, transparent 60%)',
                      }}
                    />

                    {/* Hover glow */}
                    {isHovered && (
                      <div
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{
                          background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
                        }}
                      />
                    )}
                  </div>

                  {/* White ring */}
                  <div
                    className={`
                        absolute inset-0 rounded-full 
                        ${isHovered ? ' scale-120' : ' scale-100'}
                        transition-all duration-300
                        pointer-events-none
                      `}
                    style={{
                      boxShadow: isHovered
                        ? '0 0 25px rgba(255,255,255,0.9), 0 0 50px rgba(16,185,129,0.5)'
                        : '0 4px 10px rgba(0,0,0,0.15)',
                    }}
                  />

                  {/* Shadow underneath */}
                  <div
                    className={`
                        absolute -bottom-4 left-1/2 -translate-x-1/2
                        w-24 h-6 rounded-full blur-xl
                        ${isHovered ? 'opacity-60 scale-115' : 'opacity-35 scale-100'}
                        transition-all duration-300
                      `}
                    style={{
                      background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
                    }}
                  />
                </button>

                {/* Tooltip */}
                <div
                  className={`
                      absolute -bottom-12 left-1/2 -translate-x-1/2
                      bg-gray-900/95 text-white text-sm px-4 py-2 rounded-xl
                      whitespace-nowrap backdrop-blur-sm
                      transition-all duration-300
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                      pointer-events-none
                      z-10
                    `}
                  style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {mat.materialName}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 rotate-45" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
        }}
      />

      <style jsx>{`
          @keyframes spinSphere {
            0% {
              transform: rotateZ(0deg) rotateZ(0deg);
            }
            50% {
              transform: rotateZ(180deg) rotateZ(5deg);
            }
            100% {
              transform: rotateZ(360deg) rotateZ(0deg);
            }
          }
        `}</style>
    </div>
  );
}

export default React.memo(MaterialPicker);