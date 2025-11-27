import { Suspense, useContext, useEffect, useMemo } from "react"
import * as THREE from "three"
import { Billboard, Html, Text } from "@react-three/drei"
import { data } from "../config/data"

export default function MeasurementLabels({ scene, showMeasurements, setShowMeasurements }) {
  const enabled = showMeasurements
  const measurements = useMemo(() => {
    if (!scene || !enabled) return []

    const meshes = []
    scene.traverse((child) => {
      if (child.isMesh && child.visible && data.measurementConfig[child.name]) {
        meshes.push(child)
      }
    })

    const box = new THREE.Box3()
    const entries = []

    meshes.forEach((mesh) => {
      box.setFromObject(mesh)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)

      const config = data.measurementConfig[mesh.name]
      entries.push({ mesh, size, center, id: mesh.uuid, config })
    })

    return entries
  }, [enabled])


  useEffect(() => {
    if (!scene || !enabled) return
    const group = new THREE.Group()
    scene.add(group)

    measurements.forEach(({ size, center, config }) => {
      const { offset = {}, show = [], gap = {} } = config
      const boxMin = center.clone().sub(size.clone().multiplyScalar(0.5))
      const boxMax = center.clone().add(size.clone().multiplyScalar(0.5))

      // === WIDTH ===
      if (show.includes("width")) {
        const o = offset.width || { x: 0, y: 0, z: 0 }
        const g = gap.width ?? 15
        const offsetVec = new THREE.Vector3(o.x, o.y, o.z)

        if (g > 0) {
          // Split into two arrows with gap
          const widthStartLeft = new THREE.Vector3(boxMin.x, center.y, center.z).add(offsetVec)
          const widthEndLeft = new THREE.Vector3(center.x - g / 2, center.y, center.z).add(offsetVec)
          const widthStartRight = new THREE.Vector3(center.x + g / 2, center.y, center.z).add(offsetVec)
          const widthEndRight = new THREE.Vector3(boxMax.x, center.y, center.z).add(offsetVec)
          group.add(createArrow(widthStartLeft, widthEndLeft, 0x000000, 0.005,true,false,"meshStartLine"))
          group.add(createArrow(widthStartRight, widthEndRight, 0x000000, 0.005,false,true,"meshEndLine"))
        } else {
          // Continuous line
          const start = new THREE.Vector3(boxMin.x, center.y, center.z).add(offsetVec)
          const end = new THREE.Vector3(boxMax.x, center.y, center.z).add(offsetVec)
          group.add(createArrow(start, end, 0x000000, 0.005, true,true,"wholeMeshLine"))
        }
      }

      // === HEIGHT ===
      if (show.includes("height")) {
        const o = offset.height || { x: 0, y: 0, z: 0 }
        const g = gap.height ?? 15
        const offsetVec = new THREE.Vector3(o.x, o.y, o.z)


        if (g > 0) {
          const heightStartBottom = new THREE.Vector3(center.x, boxMin.y, center.z).add(offsetVec)
          const heightEndBottom = new THREE.Vector3(center.x, center.y - g / 2, center.z).add(offsetVec)
          const heightStartTop = new THREE.Vector3(center.x, center.y + g / 2, center.z).add(offsetVec)
          const heightEndTop = new THREE.Vector3(center.x, boxMax.y, center.z).add(offsetVec)
          group.add(createArrow(heightEndTop, heightStartTop, 0x000000, 0.005,true,false,"meshStartLine"))
          group.add(createArrow(heightEndBottom, heightStartBottom, 0x000000, 0.005,false,true,"meshEndLine"))
        } else {
          const start = new THREE.Vector3(center.x, boxMin.y, center.z).add(offsetVec)
          const end = new THREE.Vector3(center.x, boxMax.y, center.z).add(offsetVec)
          group.add(createArrow(start, end, 0x000000, 0.005, true,true,"wholeMeshLine"))
        }
      }

      // === DEPTH ===
      if (show.includes("depth")) {
        const o = offset.depth || { x: 0, y: 0, z: 0 }
        const g = gap.depth ?? 15
        const offsetVec = new THREE.Vector3(o.x, o.y, o.z)


        if (g > 0) {
          const depthStartFront = new THREE.Vector3(center.x, center.y, boxMin.z).add(offsetVec)
          const depthEndFront = new THREE.Vector3(center.x, center.y, center.z - g / 2).add(offsetVec)
          const depthStartBack = new THREE.Vector3(center.x, center.y, center.z + g / 2).add(offsetVec)
          const depthEndBack = new THREE.Vector3(center.x, center.y, boxMax.z).add(offsetVec)
          group.add(createArrow(depthStartFront, depthEndFront, 0x000000, 0.005, true,false,"meshStartLine"))
          group.add(createArrow(depthStartBack, depthEndBack, 0x000000, 0.005,false,true,"meshEndLine"))
        } else {
          const start = new THREE.Vector3(center.x, center.y, boxMin.z).add(offsetVec)
          const end = new THREE.Vector3(center.x, center.y, boxMax.z).add(offsetVec)
          group.add(createArrow(start, end, 0x000000, 0.005, true,true,"wholeMeshLine"))
        }
      }
    })

    return () => {
      scene.remove(group)
      group.clear()
    }
  }, [scene, enabled, measurements])


  if (!enabled) return null

  return (
    <>
      {measurements.map(({ id, center, size, config }) => {
        const { offset = {}, show = [], extraOffsetLabel = {} } = config
        const totalOffset = {
          width: {
            x: (offset.width?.x ?? 0) + (extraOffsetLabel.width?.x ?? 0),
            y: (offset.width?.y ?? 0) + (extraOffsetLabel.width?.y ?? 0),
            z: (offset.width?.z ?? 0) + (extraOffsetLabel.width?.z ?? 0),
          },
          height: {
            x: (offset.height?.x ?? 0) + (extraOffsetLabel.height?.x ?? 0),
            y: (offset.height?.y ?? 0) + (extraOffsetLabel.height?.y ?? 0),
            z: (offset.height?.z ?? 0) + (extraOffsetLabel.height?.z ?? 0),
          },
          depth: {
            x: (offset.depth?.x ?? 0) + (extraOffsetLabel.depth?.x ?? 0),
            y: (offset.depth?.y ?? 0) + (extraOffsetLabel.depth?.y ?? 0),
            z: (offset.depth?.z ?? 0) + (extraOffsetLabel.depth?.z ?? 0),
          },
        }


        return (
          <group key={id}>
            {show.includes("width") && (
              <Billboard
                position={[(totalOffset.width?.x || 0) + center.x, (totalOffset.width?.y || 0) + center.y, center.z + (totalOffset.width?.z || 0)]}
              >
                <Suspense fallback={null}>
                  <Text
                    //  font="/fonts/Roboto-Regular.ttf"
                    fontSize={0.03}
                    outlineWidth={0.001}
                    color="black"
                    anchorX="center" // Horizontal alignment
                    anchorY="middle" // Vertical alignment
                  >
                    {`${size.x.toFixed(1)} cm`}
                  </Text>
                </Suspense>
              </Billboard>
            )}

            {show.includes("height") && (
              <Billboard
                position={[center.x + (totalOffset.height?.x || 0), center.y + (totalOffset.height?.y || 0), center.z + (totalOffset.height?.z || 0)]}
              >
                <Suspense fallback={null}>
                  <Text
                    //  font="/fonts/Roboto-Regular.ttf"
                    fontSize={0.03}
                    outlineWidth={0.001}
                    color="black"
                    anchorX="center" // Horizontal alignment
                    anchorY="middle" // Vertical alignment
                  >
                    {`${size.y.toFixed(1)} cm`}
                  </Text>
                </Suspense>
              </Billboard>
            )}

            {show.includes("depth") && (
              <Billboard
                position={[center.x + (totalOffset.depth?.x || 0), center.y + (totalOffset.depth?.y || 0), center.z + (totalOffset.depth?.z || 0)]}
              >
                <Suspense fallback={null}>
                  <Text
                    //  font="/fonts/Roboto-Regular.ttf"
                    fontSize={0.03}
                    outlineWidth={0.001}
                    color="black"
                    anchorX="center" // Horizontal alignment
                    anchorY="middle" // Vertical alignment
                  // rotation={[0, Math.PI / 2, 0]}
                  >
                    {`${size.z.toFixed(1)} cm`}
                  </Text>
                </Suspense>
              </Billboard>
            )}
          </group>
        )

      })}
    </>
  )
}


function createArrow(start, end, color = 0xff0000, radius = 0.5, isTick1Required, isTick2Required,meshLineType) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const arrowDir = dir.clone().normalize();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  // === MAIN SHAFT ===
  const shaftGeometry = new THREE.CylinderGeometry(radius, radius, length, 4);

  if(meshLineType=="meshEndLine" ){ shaftGeometry.translate(0, length / 2, 0); }
  else if( meshLineType=="meshStartLine"){ shaftGeometry.translate(0, -length / 2, 0); }


  const shaftMaterial = new THREE.MeshBasicMaterial({ color });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);

  // Start collapsed from 0 → full length
  shaft.scale.y = 0.0001;

  if(meshLineType=="meshEndLine" ){ shaft.position.copy(start); }
  else if(meshLineType=="meshStartLine" ){ shaft.position.copy(end); }
  else if(meshLineType=="wholeMeshLine" ){ shaft.position.copy(mid); }



  // Rotate so Y-axis aligns with arrow direction
  shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDir);


  // === TICKS ===
  const tickLength = 0.04;
  const tickRadius = radius;
  const tickGeometry = new THREE.CylinderGeometry(tickRadius, tickRadius, tickLength, 4);

  const up = new THREE.Vector3(1, 0, 0);
  let perp = new THREE.Vector3().crossVectors(arrowDir, up).normalize();

  const tickDir = perp.clone();

  const tick1 = new THREE.Mesh(tickGeometry, shaftMaterial);
  const tick2 = new THREE.Mesh(tickGeometry, shaftMaterial);

  tick1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tickDir);
  tick2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tickDir);

  tick1.position.copy(start);
  tick2.position.copy(end);

  tick1.scale.set(0.0001, 0.0001, 0.0001);
  tick2.scale.set(0.0001, 0.0001, 0.0001);


  // === GROUP ===
  const arrowGroup = new THREE.Group();
  arrowGroup.add(shaft);
  if (isTick1Required) arrowGroup.add(tick1);
  if (isTick2Required) arrowGroup.add(tick2);


  // === ANIMATION ===
  let t = 0;
  const duration = 0.16;

  function animate() {
    if (t < 0.9) {
      t += 0.016 / duration; // 0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1

      const eased = t * (2 - t); // ease-out 0.19,0.36,0.51 ,0.64,0.75,0.84,0.91,0.96,0.98,0.99

      // Shaft grows ONLY from start → end
      shaft.scale.y = eased;

      // Ticks appear after 70%
      if (eased > 0.7) {
        const tickScale = (eased - 0.7) / 0.3;

        if (isTick1Required) tick1.scale.setScalar(tickScale);
        if (isTick2Required) tick2.scale.setScalar(tickScale);
      }

      requestAnimationFrame(animate);
    }
  }

  animate();
  return arrowGroup;
}

