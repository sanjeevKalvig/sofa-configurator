// src/components/SmoothOutline.jsx
import { useEffect } from "react";
import * as THREE from "three";

export default function SmoothOutline({ hoveredMesh, meshToCategory }) {
  useEffect(() => {
    if (!hoveredMesh) return;

    const category = meshToCategory[hoveredMesh.name];
    let outlineColor;

    if (category === "Cushion Type") {
      outlineColor = 0x10b981; // Green
    } else if (category === "Fabric Material") {
      outlineColor = 0x3b82f6; // Blue
    } else if (category === "Sofa Leg Type") {
      outlineColor = 0xf59e0b; // Orange
    } else {
      outlineColor = 0xffffff;
    }

    // Create outline material
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: outlineColor,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.9,
    });

    // Clone geometry for outline
    const outlineGeometry = hoveredMesh.geometry.clone();
    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    
    // Scale slightly larger for outline effect
    outlineMesh.scale.set(1.02, 1.02, 1.02);
    outlineMesh.renderOrder = -1; // Render behind main mesh
    
    hoveredMesh.add(outlineMesh);

    return () => {
      hoveredMesh.remove(outlineMesh);
      outlineGeometry.dispose();
      outlineMaterial.dispose();
    };
  }, [hoveredMesh, meshToCategory]);

  return null;
}
