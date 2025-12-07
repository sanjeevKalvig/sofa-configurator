/* Multilevel LOD + Multi-model loader + Texture-LOD + UI-driven material switching + Transform support */

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { data } from "../config/data";
import { getModel } from "../utils/modelCache";
import { getMaterialById } from "../config/getterMappedDatafunctions";
import { getTexture } from "../utils/textureCache";
import MeasurementLabels from "./MeasurementLabels";
import Effects from "./Effects";

/**
 * Helper: create a MeshStandardMaterial from a material texture set
 */
function makeMaterialFromTextureSet(texturePaths = {}) {
    const matParams = {};

    const base = getTexture(texturePaths.baseColorPath);
    const normal = getTexture(texturePaths.normalPath);
    const roughness = getTexture(texturePaths.roughnessPath);
    const metallic = getTexture(texturePaths.metallicPath);
    const displacement = getTexture(texturePaths.displacementPath);

    if (base) matParams.map = base;
    if (normal) matParams.normalMap = normal;
    if (roughness) matParams.roughnessMap = roughness;
    if (metallic) matParams.metalnessMap = metallic;
    if (displacement) {
        matParams.displacementMap = displacement;
        matParams.displacementScale = 0.02;
    }

    matParams.roughness = matParams.roughness !== undefined ? undefined : 1.0;
    matParams.metalness = matParams.metalness !== undefined ? undefined : 0.0;

    const mat = new THREE.MeshStandardMaterial(matParams);
    mat.needsUpdate = true;
    return mat;
}

/**
 * Build meshName -> category map
 */
function buildMeshCategoryMap(config) {
    const map = {};
    const categories = config.sofaMeshCategories || {};
    Object.entries(categories).forEach(([cat, names]) => {
        if (!Array.isArray(names)) return;
        names.forEach((n) => (map[n] = cat));
    });
    return map;
}

/**
 * Apply transforms to an object
 */
function applyTransforms(object, config) {
    if (!config) return;
    if (config.position) object.position.fromArray(config.position);
    if (config.scale) object.scale.fromArray(config.scale);

    if (config.rotation) {
        const r = Array.isArray(config.rotation)
            ? config.rotation
            : config.rotation.split(",").map(Number);

        object.rotation.set(
            THREE.MathUtils.degToRad(r[0] || 0),
            THREE.MathUtils.degToRad(r[1] || 0),
            THREE.MathUtils.degToRad(r[2] || 0)
        );
    }
}

// ✅ NOW EXPORT MODEL
export const Model = ({
    showMeasurements,
    setShowMeasurements,
    setClickedMeshCategory,
    setHoveredMesh,
    hoveredMesh,
    clickedMeshCategoryRef
}) => {
    const { camera, gl } = useThree();
    const rootRef = useRef();
    const currentCameraDistance = useRef(1000000);
    const [dof,setdof]=useState(1000000)
    const isDragging = useRef(false);
    const downPos = useRef({ x: 0, y: 0 });


    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());

    const modelEntries = useMemo(() => Object.entries(data.models), []);
    const sofaConfig = data.models.Sofa;

    const meshToCategory = useMemo(
        () => buildMeshCategoryMap(sofaConfig),
        [sofaConfig]
    );

    const categoryActiveMaterial = useRef({});

    useEffect(() => {
        const mats = sofaConfig.materialsLods || [];
        const categories = Object.keys(sofaConfig.sofaMeshCategories || {});
        categories.forEach((cat) => {
            const found = mats.find((m) =>
                (m.materialUsingCategories?.categoriesNames || []).includes(cat)
            );
            if (found) {
                categoryActiveMaterial.current[cat] = found.id;
                window.dispatchEvent(
                    new CustomEvent("material-change", {
                        detail: { category: cat, materialId: found.id },
                    })
                );
            }
        });
    }, [sofaConfig]);

    const preparedModels = useMemo(() => {
        return modelEntries.map(([name, config]) => {
            if (config.lods) {
                const LODScenes = config.lods.map((lvl) => getModel(lvl.modelPath));
                const LODMaps = LODScenes.map((scene) => {
                    const map = {};
                    if (!scene) return map;
                    scene.traverse((n) => {
                        if (n.isMesh) {
                            const clone = n.clone(false);
                            clone.geometry = n.geometry.clone();
                            clone.material = Array.isArray(n.material)
                                ? n.material.map((m) => m.clone())
                                : n.material.clone();

                            clone.geometry.computeBoundingBox();
                            clone._bbox = clone.geometry.boundingBox.clone();

                            map[n.name] = clone;
                        }
                    });
                    return map;
                });

                return {
                    type: "lod",
                    name,
                    config,
                    LODMaps,
                    group: new THREE.Group(),
                    activeMeshName: null,
                    activeLOD: null,
                };
            }

            return {
                type: "simple",
                name,
                config,
                scene: getModel(config.modelPath)?.clone(true) ?? null,
            };
        });
    }, [modelEntries]);

    function getTexturePathsForMaterialId(
        { materialId, minDist },
        isDefaultTexture = false
    ) {
        const matEntry = getMaterialById(materialId);
        if (!matEntry) return null;
        if (isDefaultTexture) {
            const allMaterialLodsArray = Object.values(
                matEntry.materialTexturePaths
            );
            return allMaterialLodsArray[allMaterialLodsArray.length - 1];
        }
        let newTextureLODIndex = matEntry.materialThresholds.length - 1;
        for (let i = 0; i < matEntry.materialThresholds.length; i++) {
            if (minDist < matEntry.materialThresholds[i]) {
                newTextureLODIndex = i;
                break;
            }
        }
        return (
            Object.values(matEntry.materialTexturePaths)[newTextureLODIndex] ||
            null
        );
    }

    function applyMaterialToMesh(
        { mesh, materialId, minDist },
        isDefaultTexture
    ) {
        const texPaths = getTexturePathsForMaterialId(
            { materialId, minDist },
            isDefaultTexture
        );
        if (!texPaths) return;

        const newMat = makeMaterialFromTextureSet(texPaths);

        if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(() => newMat.clone());
        } else {
            mesh.material = newMat;
        }
        mesh.material.needsUpdate = true;
    }

    function applyCategoryMaterialToMesh({ mesh, minDist }, isDefaultTexture) {
        const category = meshToCategory[mesh.name];
        if (!category) return;
        const materialId = categoryActiveMaterial.current[category];
        if (!materialId) return;
        applyMaterialToMesh({ mesh, materialId, minDist }, isDefaultTexture);
    }

    function applyDefaultTexturesToLowestLODMap(lowestLODMap) {
        let isDefaultTexture = true;
        Object.values(lowestLODMap).forEach((mesh) => {
            applyCategoryMaterialToMesh({ mesh }, isDefaultTexture);
        });
    }

    useEffect(() => {
        if (!rootRef.current) return;

        preparedModels.forEach((model) => {
            if (model.type === "simple") {
                if (!model.scene) return;
                applyTransforms(model.scene, model.config);
                rootRef.current.add(model.scene);
            }

            if (model.type === "lod") {
                const lowestLODMap = model.LODMaps[model.LODMaps.length - 1];
                Object.values(lowestLODMap).forEach((mesh) => {
                    model.group.add(mesh);
                });

                applyTransforms(model.group, model.config);
                applyDefaultTexturesToLowestLODMap(lowestLODMap);

                rootRef.current.add(model.group);
                model.activeLOD = model.LODMaps.length - 1;
            }
        });

        const onMaterialChange = (e) => {
            const { category, materialId } = e.detail || {};
            if (!category || materialId == null) return;
            categoryActiveMaterial.current[category] = String(materialId);

            preparedModels.forEach((model) => {
                if (model.type !== "lod") return;
                const lowestLODMap = model.LODMaps[model.LODMaps.length - 1];
                Object.values(lowestLODMap).forEach((mesh) => {
                    const cat = meshToCategory[mesh.name];
                    if (cat !== category) return;
                    if (
                        model.activeMeshName === mesh.name &&
                        model.activeLOD != null
                    ) {
                        const aname = model.LODMaps[model.activeLOD][mesh.name];
                        applyCategoryMaterialToMesh({
                            mesh: aname,
                            minDist: currentCameraDistance.current,
                        });
                    } else {
                        applyCategoryMaterialToMesh(
                            { mesh, minDist: currentCameraDistance.current },
                            true
                        );
                    }
                });
            });
        };

        window.addEventListener("material-change", onMaterialChange);
        return () =>
            window.removeEventListener("material-change", onMaterialChange);
    }, [preparedModels, meshToCategory]);

    useFrame(() => {
        preparedModels.forEach((model) => {
            if (model.type !== "lod") return;
            if (model.activeLOD == null) return;

            const { LODMaps, config, group } = model;
            const thresholds = config.thresholds;
            const lowestLODMap = LODMaps[LODMaps.length - 1];
            const camPos = camera.position;

            let closestMeshName = null;
            let minDist = Infinity;
            const tmp = new THREE.Vector3();

            Object.values(lowestLODMap).forEach((mesh) => {
                const worldBox = mesh._bbox
                    .clone()
                    .applyMatrix4(mesh.matrixWorld);
                worldBox.clampPoint(camPos, tmp);
                const dist = camPos.distanceTo(tmp);
                if (dist < minDist) {
                    minDist = dist;
                    closestMeshName = mesh.name;
                }
            });

            currentCameraDistance.current = minDist;
            setdof(minDist)

            if (!closestMeshName) return;

            let newLODIndex = thresholds.length - 1;
            for (let i = 0; i < thresholds.length; i++) {
                if (minDist < thresholds[i]) {
                    newLODIndex = i;
                    break;
                }
            }

            if (
                model.activeMeshName === closestMeshName &&
                model.activeLOD === newLODIndex
            )
                return;

            if (model.activeMeshName != null && model.activeLOD != null) {
                const prevMesh = LODMaps[model.activeLOD][model.activeMeshName];
                if (prevMesh && prevMesh.parent === group)
                    group.remove(prevMesh);

                const lowMesh = lowestLODMap[model.activeMeshName];
                if (lowMesh && !lowMesh.parent) group.add(lowMesh);

                const cat = meshToCategory[model.activeMeshName];
                if (cat && model.activeMeshName !== closestMeshName) {
                    applyCategoryMaterialToMesh({ mesh: lowMesh, minDist }, true);
                }
            }

            const lowMesh = lowestLODMap[closestMeshName];
            if (lowMesh && lowMesh.parent === group) group.remove(lowMesh);

            const newMesh = LODMaps[newLODIndex][closestMeshName];
            if (newMesh) {
                applyCategoryMaterialToMesh({ mesh: newMesh, minDist });
                group.add(newMesh);
            }

            model.activeMeshName = closestMeshName;
            model.activeLOD = newLODIndex;
        });


        // Hover glow effect
        // preparedModels.forEach((model) => {
        //     if (model.type !== "lod") return;

        //     model.LODMaps.forEach((lodMap) => {
        //         Object.values(lodMap).forEach((mesh) => {
        //             const category = meshToCategory[mesh.name];

        //             if (
        //                 category === "Cushion Type" ||
        //                 category === "Cushion Type2" ||
        //                 category === "Cushion Type3" ||
        //                 category === "Fabric Material" ||
        //                 category === "Sofa Leg Type" ||
        //                 category === "Towel Material"
        //             ) {
        //                 const materials = Array.isArray(mesh.material)
        //                     ? mesh.material
        //                     : [mesh.material];

        //                 materials.forEach((mat) => {
        //                     if (hoveredMesh && mesh === hoveredMesh) {
        //                         if (category === "Cushion Type" || category === "Cushion Type2" || category === "Cushion Type3") {
        //                             mat.emissive = new THREE.Color(0xb98110);
        //                         } else if (category === "Fabric Material" || category === "Towel Material") {
        //                             mat.emissive = new THREE.Color(0x3b82f6);
        //                         } else if (category === "Sofa Leg Type") {
        //                             mat.emissive = new THREE.Color(0xf59e0b);
        //                         }
        //                         mat.emissiveIntensity = 0.4;
        //                     } else {
        //                         mat.emissive = new THREE.Color(0x000000);
        //                         mat.emissiveIntensity = 0;
        //                     }
        //                 });
        //             }
        //         });
        //     });
        // });
    });

    const handlePointerDown = (e) => {
        // console.log("pointer down")
        isDragging.current = false;
        downPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
        // console.log("pointer move")
        const dx = Math.abs(e.clientX - downPos.current.x);
        const dy = Math.abs(e.clientY - downPos.current.y);

        if (dx > 4 || dy > 4) {
            isDragging.current = true;
        }
    };

    const handlePointerUp = (e) => {
        // console.log("pointer up")
        if (isDragging.current) return;  // ⛔ Ignore end-of-drag clicks

        // Continue your raycast logic
        const { camera } = e;
        const mouse = new THREE.Vector2();

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.current.setFromCamera(mouse, camera);

        const intersects = raycaster.current.intersectObjects(
            rootRef.current.children,
            true
        );

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const category = meshToCategory[clickedObject.name];
            if (category) {
                setClickedMeshCategory(category);
                clickedMeshCategoryRef.current = category;
            }
            else {
                setClickedMeshCategory("");
                clickedMeshCategoryRef.current = "";
            }
        } else {
            setClickedMeshCategory("");
            clickedMeshCategoryRef.current = "";
        }
    };

    const handlePointerOver = (e) => {
        // console.log("pointer over")
        e.stopPropagation();
        const object = e.object;

        const category = meshToCategory[object.name];

        if (
            category === "Cushion Type" ||
            category === "Cushion Type2" ||
            category === "Cushion Type3" ||
            category === "Fabric Material" ||
            category === "Sofa Leg Type" ||
            category === "Towel Material"
        ) {
            gl.domElement.style.cursor = "pointer";
            setHoveredMesh(object);
        } else {
            gl.domElement.style.cursor = "default";
            setHoveredMesh(null);
        }
    };

    const handlePointerOut = (e) => {
        // console.log("pointer out")
        if (!clickedMeshCategoryRef.current) {
            gl.domElement.style.cursor = "default";
            setHoveredMesh(null);
        }
    };

    return (
        <>
            <group
                ref={rootRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            />
            <MeasurementLabels
                scene={rootRef.current}
                showMeasurements={showMeasurements}
                setShowMeasurements={setShowMeasurements}
            />
              {/* {dof<0.7 && <Effects dofEffectDistance={dof}/>} */}
        </>
    );
};
