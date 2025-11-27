// import { useEffect, useRef } from "react";
// import { Pane } from "tweakpane";
// import { useThree } from "@react-three/fiber";
// import * as THREE from 'three';

// export function useCameraEditor() {
//   const { camera, gl } = useThree();
//   const paneRef = useRef(null);

//   useEffect(() => {
//     if (paneRef.current) return;

//     // Try to find existing controls in the scene
//     const controls = gl.domElement.previousSibling?.userData?.controls; // This is a heuristic, might need adjustment based on your setup

//     const pane = new Pane({ title: "Camera Controls" });
//     paneRef.current = pane;

//     const params = {
//       position: new THREE.Vector3().copy(camera.position),
//     };

//     const folder = pane.addFolder({ title: "Camera Position" });

//     // Function to update both the camera and controls position
//     const updateCameraAndControls = () => {
//         camera.position.copy(params.position);
//         if (controls && typeof controls.update === 'function') {
//             // controls.target.addVectors(params.position, new THREE.Vector3(0, 0, -10)); // Example target adjustment
//             // A better way might be to adjust the controls' target relative to the camera's new position if needed.
//             // For OrbitControls, the camera position is derived from the target, distance, and angles. 
//             // Setting the camera position directly might fight with OrbitControls' internal logic.
//             // A more robust solution might involve updating the controls' parameters directly, or managing camera movement through controls' API.

//             // If OrbitControls is present, it will eventually overwrite camera.position
//             // A simple update call might not be enough
//             // Consider using a dedicated helper for camera controls if you need robust UI for it.
//             controls.update(); 
//         }
//     };

//     // Replace addInput with addBinding
//     folder.addBinding(params.position, "x", { step: 0.1 }).on("change", updateCameraAndControls);
//     folder.addBinding(params.position, "y", { step: 0.1 }).on("change", updateCameraAndControls);
//     folder.addBinding(params.position, "z", { step: 0.1 }).on("change", updateCameraAndControls);

//     // If you are using controls that move the camera, this will sync the UI with the camera movement
//     const updateInterval = setInterval(() => {
//         params.position.copy(camera.position);
//         pane.refresh();
//     }, 500);

//     return () => {
//       clearInterval(updateInterval);
//       pane.dispose();
//       paneRef.current = null;
//     };
//   }, [camera, gl]);
// }











import { useEffect, useRef } from "react";
import { Pane } from "tweakpane";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function useCameraEditor(controlsRef) {
  const { camera } = useThree();
  const paneRef = useRef(null);

  useEffect(() => {
    if (paneRef.current) return;

    const pane = new Pane({ title: "Camera Controls" });
    paneRef.current = pane;

    // --- Camera Parameters ---
    const params = {
      position: new THREE.Vector3().copy(camera.position),
      lookAt: new THREE.Vector3(0, 0, 0),
    };

    // Try to get controls from ref
    const controls = controlsRef?.current || null;

    // ========== CAMERA POSITION ==========
    const posFolder = pane.addFolder({ title: "Camera Position" });

    const updateCameraPosition = () => {
      camera.position.copy(params.position);
      if (controls) controls.update();
    };

    posFolder.addBinding(params.position, "x", { step: 0.1 }).on("change", updateCameraPosition);
    posFolder.addBinding(params.position, "y", { step: 0.1 }).on("change", updateCameraPosition);
    posFolder.addBinding(params.position, "z", { step: 0.1 }).on("change", updateCameraPosition);

    // ========== CAMERA LOOK AT ==========
    const lookFolder = pane.addFolder({ title: "Camera LookAt" });

    const updateCameraLookAt = () => {
      camera.lookAt(params.lookAt);
      if (controls) {
        controls.target.copy(params.lookAt);
        controls.update();
      }
    };

    lookFolder.addBinding(params.lookAt, "x", { step: 0.1 }).on("change", updateCameraLookAt);
    lookFolder.addBinding(params.lookAt, "y", { step: 0.1 }).on("change", updateCameraLookAt);
    lookFolder.addBinding(params.lookAt, "z", { step: 0.1 }).on("change", updateCameraLookAt);

    // Sync UI with live camera
    const updateInterval = setInterval(() => {
      params.position.copy(camera.position);
      if (controls) params.lookAt.copy(controls.target);
      pane.refresh();
    }, 500);

    return () => {
      clearInterval(updateInterval);
      pane.dispose();
      paneRef.current = null;
    };
  }, [camera, controlsRef]);
}
