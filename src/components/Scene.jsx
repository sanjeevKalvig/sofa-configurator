import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { data } from "../config/data";
import Lights from "./Lights";
import { Model } from "./Model";
import AntiAliasing from "./AntiAliasing";
import MaterialPicker from "./MaterialPicker";
import SmoothOutline from "./SmoothOutline"
import { CameraRefBridge } from "./CameraRefBridge";
import gsap from "gsap";
import MeshDetailsPanel from "./MeshDetailsPanel";

export default function Scene({ showMeasurements, setShowMeasurements,activeMaterial, setActiveMaterial,categorySelectedMaterial,setCategorySelectedMaterial,clickedMeshCategory,setClickedMeshCategory }) {
  const controlsRef = useRef();
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const clickedMeshCategoryRef = useRef("");
  const cameraRef = useRef();
  const [isUserNotified, setIsUserNotified] = useState(true);


  useEffect(() => {
    console.log(categorySelectedMaterial)
    if (!clickedMeshCategory) return;

    // If this category already has a stored material → use it
    if (categorySelectedMaterial[clickedMeshCategory] !== undefined) {
      setActiveMaterial(
        categorySelectedMaterial[clickedMeshCategory]
      );
      return;
    }

    // Otherwise, set default material for first time
    const defaultMat = data.models.Sofa.materialsLods.find((m) =>
      m.materialUsingCategories.categoriesNames.includes(
        clickedMeshCategory
      )
    );

    if (defaultMat) {
      setActiveMaterial({materialId:defaultMat.id,materialName:defaultMat.materialName});
      setCategorySelectedMaterial((prevDetail) => ({
        ...prevDetail,
        [clickedMeshCategory]: {materialId:defaultMat.id,materialName:defaultMat.materialName}
      }))
    }
  }, [clickedMeshCategory]);


  return (
    <>
      <Canvas
        shadows
        gl={{
          antialias: false,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{
          fov: 30,
        }}
        className="bg-white"
      >
        <PerspectiveCamera
          makeDefault
          position={data.camera.position}
          onUpdate={(cam) => {
            cam.layers.enable(1); // room layer
            cam.layers.enable(2); // sofa layer  lod-0
            cam.layers.enable(3); // sofa layer other than lod-0
          }}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping={false}
          minDistance={data.camera.minDistance}
          maxDistance={data.camera.maxDistance}
          minPolarAngle={data.camera.minPolarAngle}
          maxPolarAngle={data.camera.maxPolarAngle}
        />
        <Environment files="/hdr/baked.hdr" background={false} />
        {/* <Lights /> */}
        <Model
          showMeasurements={showMeasurements}
          setShowMeasurements={setShowMeasurements}
          controlsRef={controlsRef}
          setClickedMeshCategory={setClickedMeshCategory}
          hoveredMesh={hoveredMesh}
          setHoveredMesh={setHoveredMesh}
          clickedMeshCategoryRef={clickedMeshCategoryRef}
          clickedMeshCategory={clickedMeshCategory}
        />
        <AntiAliasing controlsRef={controlsRef} />
        <SmoothOutline hoveredMesh={hoveredMesh} />
        <CameraRefBridge cameraRef={cameraRef} />
      </Canvas>
      {/*  HTML Overlay - outside Canvas */}
      <MaterialPicker
        clickedMeshCategory={clickedMeshCategory}
        categorySelectedMaterial={categorySelectedMaterial}
        activeMaterial={activeMaterial}
        setActiveMaterial={setActiveMaterial}
        setCategorySelectedMaterial={setCategorySelectedMaterial}
      />

      {
        clickedMeshCategory && (
          <MeshDetailsPanel
            isUserNotified={isUserNotified}
            setIsUserNotified={setIsUserNotified}
            activeMaterial={activeMaterial}
            hoveredMesh={hoveredMesh}
            onClose={() => {
              setClickedMeshCategory("");
              clickedMeshCategoryRef.current = "";
              setHoveredMesh(null);

              // Camera animation
              gsap.to(cameraRef.current.position, {
                x: -1,
                y: 1,
                z: 2,
                duration: 0.8,
              });

              gsap.to(controlsRef.current.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.8,
              });
            }}
          />
        )
      }

    </>
  );
}
