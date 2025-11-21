import React, { useRef } from "react"
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { data } from "../config/data"
import Lights from "./Lights"
import { Model } from "./Model"
import AntiAliasing from "./AntiAliasing"


export default function Scene({showMeasurements,setShowMeasurements}) {
    const controlsRef = useRef()

    return (
        <Canvas
            shadows
            gl={{
                antialias: false,
                outputColorSpace: THREE.SRGBColorSpace,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.0,
            }}
            camera={{
                fov:30
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
            <Environment files="/hdr/baked.hdr" background={false}/>
            {/* <Lights /> */}
            <Model showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}/>
            <AntiAliasing controlsRef={controlsRef}/>
        </Canvas>
    )
}