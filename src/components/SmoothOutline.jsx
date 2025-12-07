// // src/components/SmoothOutline.jsx
import { useEffect } from "react";
import * as THREE from "three";

export default function SmoothOutline({ hoveredMesh }) {

  useEffect(() => {
    if (!hoveredMesh) return;

    // Create outline material
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x004BBE,
      side: THREE.BackSide,
      // transparent: true,
      // opacity: 0.9,
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
  }, [hoveredMesh]);

  return null;
}





// Using outline model

// import { useEffect, useRef } from "react";
// import { useThree, useFrame } from "@react-three/fiber";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// // 1️⃣ Mapping table for mismatched names
// const OUTLINE_MAP = {
//   "Sofa Leg Type": "Outline_Leg",
//   "Cushion Type": "Outline_Pillow",
//   "Cushion Type3": "Outline_Pillow001",
//   "Cushion Type2": "Outline_Pillow002",
//   "Towel Material": "Outline_Towel",
//   "Fabric Material": "Outline_Sofa"
// };

// export default function SmoothOutline({ hoveredMesh }) {
//   const outlineGroup = useRef();
//   const { scene } = useThree();

//   var outlineMaterial1 = new THREE.MeshBasicMaterial({ 
//       color: 0x004BBE, 
//       side: THREE.BackSide,
//       depthTest:false,
//       toneMapped:false
//     })

//   // Load Outline Model Once
//   useEffect(() => {

//     const dracoLoader = new DRACOLoader();
//     dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

//     const loader = new GLTFLoader();
//     loader.setDRACOLoader(dracoLoader);


//     loader.load("/models/Outline_All.glb", (gltf) => {
//       console.log("outline model loaded")
//       outlineGroup.current = gltf.scene;
//       outlineGroup.current.visible = true;

//       // Hide all outline meshes initially
//       outlineGroup.current.traverse((c) => {
//         if (c.isMesh) {
//           c.material = outlineMaterial1
//           c.visible = false;
//         }
//       });

//       scene.add(outlineGroup.current);
//     });
//   }, []);

//   useFrame(() => {
//     if (!outlineGroup.current) return;

//     outlineGroup.current.traverse((outlineMesh) => {
//       if (!outlineMesh.isMesh) return;

//       // If nothing hovered → hide all
//       if (!hoveredMesh) {
//         outlineMesh.visible = false;
//         return;
//       }

//       // Lookup correct outline name from mapping
//       const expectedOutlineName = OUTLINE_MAP[hoveredMesh];

//       // If mapping fails → hide outline
//       if (!expectedOutlineName) {
//         outlineMesh.visible = false;
//         return;
//       }

//       // Only toggle the correct outline mesh
//       outlineMesh.visible = outlineMesh.name === expectedOutlineName;

//       // Sync transform
//       // if (outlineMesh.visible) {
//       //   outlineMesh.position.copy(hoveredMesh.getWorldPosition(new THREE.Vector3()));
//       //   outlineMesh.quaternion.copy(hoveredMesh.getWorldQuaternion(new THREE.Quaternion()));
//       //   outlineMesh.scale.copy(hoveredMesh.getWorldScale(new THREE.Vector3()));
//       //   outlineMesh.updateMatrixWorld();
//       // }
//     });
//   });

//   return null;
// }