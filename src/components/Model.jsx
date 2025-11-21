// Making it perfect even model lod and texture lod are different

/* Multilevel LOD + Multi-model loader + Texture-LOD + UI-driven material switching + Transform support (Using Camera distance from each mesh) */

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { data } from "../config/data";
import { getModel } from "../utils/modelCache";
import { getMaterialById } from "../config/getterMappedDatafunctions";
import { getTexture } from "../utils/textureCache";
import Effects from "./Effects";
import MeasurementLabels from "./MeasurementLabels";

/**
 * Helper: create a MeshStandardMaterial from a material texture set
 * texturePaths is an object with keys: baseColorPath, normalPath, roughnessPath, metallicPath, displacementPath
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
        matParams.displacementScale = 0.02; // tweak as needed
    }

    // sensible defaults
    matParams.roughness = matParams.roughness !== undefined ? undefined : 1.0;
    matParams.metalness = matParams.metalness !== undefined ? undefined : 0.0;

    const mat = new THREE.MeshStandardMaterial(matParams);
    mat.needsUpdate = true;
    return mat;
}

/**
 * Determine category for a mesh name using config.sofaMeshCategories
 * returns category string or null
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

export const Model = ({showMeasurements,setShowMeasurements}) => {
    const camera = useThree((s) => s.camera);
    const rootRef = useRef();
    const [dofEffectDistance, setDofEffectDistance] = useState(1000000)
    const [dofFade, setDofFade] = useState(0); // 0 = off, 1 = full blur


    // build entries
    const modelEntries = useMemo(() => Object.entries(data.models), []);
    const sofaConfig = data.models.Sofa;

    // Build meshName -> category map (for sofa)
    const meshToCategory = useMemo(() => buildMeshCategoryMap(sofaConfig), [sofaConfig]);

    // Category active material (Option A): remember the last selected material id per category
    const categoryActiveMaterial = useRef({});
    // Initialize from data: pick first material that lists that category
    useEffect(() => {
        const mats = sofaConfig.materialsLods || [];
        // for every category defined in sofaMeshCategories, pick first found material id
        const categories = Object.keys(sofaConfig.sofaMeshCategories || {});
        categories.forEach((cat) => {
            const found = mats.find((m) => (m.materialUsingCategories?.categoriesNames || []).includes(cat));
            if (found) {
                categoryActiveMaterial.current[cat] = found.id;

                // 🔥 Send initial selection to the UI
                window.dispatchEvent(
                    new CustomEvent("material-change", {
                        detail: { category: cat, materialId: found.id }
                    })
                );
            }
        });
    }, [sofaConfig]);

    // ------------------------------------------------------------
    // PREPARE MODELS + LOD maps (same as before but we keep references)
    // ------------------------------------------------------------
    const preparedModels = useMemo(() => {
        return modelEntries.map(([name, config]) => {
            if (config.lods) {
                const LODScenes = config.lods.map((lvl) => getModel(lvl.modelPath));
                const LODMaps = LODScenes.map((scene) => {
                    const map = {};
                    if (!scene) return map;
                    scene.traverse((n) => {
                        if (n.isMesh) {
                            // clone geometry/material safely
                            const clone = n.clone(false);
                            clone.geometry = n.geometry.clone();
                            clone.material = Array.isArray(n.material)
                                ? n.material.map((m) => m.clone())
                                : n.material.clone();

                            // compute bbox once
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

            // simple model
            return {
                type: "simple",
                name,
                config,
                scene: getModel(config.modelPath)?.clone(true) ?? null,
            };
        });
    }, [modelEntries]);

    // ------------------------------------------------------------
    // APPLY TEXTURES: helper functions
    // ------------------------------------------------------------
    // find a material entry by id and return the texturePaths object for a given textureLODKey (e.g. "LOD-1")
    function getTexturePathsForMaterialId({materialId,minDist},isDefaultTexture=false ) {
        const matEntry = getMaterialById(materialId);
        if (!matEntry) return null;
        if (isDefaultTexture) {
            const allMaterialLodsArray = Object.values(matEntry.materialTexturePaths);
            return allMaterialLodsArray[allMaterialLodsArray.length - 1];
        }
        let newTextureLODIndex = matEntry.materialThresholds.length - 1;
        for (let i = 0; i < matEntry.materialThresholds.length; i++) {
            if (minDist < matEntry.materialThresholds[i]) {
                newTextureLODIndex = i;
                break;
            }
        }
        return Object.values(matEntry.materialTexturePaths)[newTextureLODIndex] || null;
    }

    // Apply a material (by materialId + lodKey) to a single mesh
    function applyMaterialToMesh({mesh, materialId,minDist}, isDefaultTexture) {
        const texPaths = getTexturePathsForMaterialId({materialId,minDist},isDefaultTexture);
        console.log(texPaths)
        if (!texPaths) return;

        const newMat = makeMaterialFromTextureSet(texPaths);

        // if mesh has multiple material slots, replace all with clones of newMat
        if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(() => newMat.clone());
        } else {
            mesh.material = newMat;
        }
        mesh.material.needsUpdate = true;
    }

    // Apply current active material for a category to a mesh using lodKey
    function applyCategoryMaterialToMesh({mesh,minDist},isDefaultTexture) {
        const category = meshToCategory[mesh.name];
        if (!category) return; // mesh not in our categories
        const materialId = categoryActiveMaterial.current[category];
        if (!materialId) return;
        applyMaterialToMesh({mesh,materialId,minDist},isDefaultTexture);
    }

    // Apply default textures to all meshes in a lowest LOD map (used on init)
    function applyDefaultTexturesToLowestLODMap(lowestLODMap) {
        let isDefaultTexture=true
        Object.values(lowestLODMap).forEach((mesh) => {
            applyCategoryMaterialToMesh({mesh},isDefaultTexture);
        });
    }

    // Setting layers for model
    useEffect(() => {
        preparedModels.forEach((model) => {
            if (model.type === "simple") {
                if (!model.scene) return;
                model.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.layers.set(1);
                    }
                });
            }
            if (model.type === "lod") {
                model.LODMaps.map((lod, index) => {
                    Object.values(lod).forEach((mesh) => {
                        if (index == 0) mesh.layers.set(2);
                        else mesh.layers.set(3);
                    })
                })
            }
        })
    }, [preparedModels])

    // ------------------------------------------------------------
    // INIT: add models to scene + apply transforms + apply default textures
    // ------------------------------------------------------------
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
                // add lowest lod meshes to group
                Object.values(lowestLODMap).forEach((mesh) => {
                    model.group.add(mesh);
                });

                // apply transforms to group
                applyTransforms(model.group, model.config);

                // apply default textures for categories on lowest LOD
                applyDefaultTexturesToLowestLODMap(lowestLODMap);

                rootRef.current.add(model.group);

                model.activeLOD = model.LODMaps.length - 1;
            }
        });

        // Listen for material-change events from UI
        const onMaterialChange = (e) => {
            const { category, materialId } = e.detail || {};
            if (!category || materialId == null) return;
            // update active material for category (Option A)
            categoryActiveMaterial.current[category] = String(materialId);

            // reapply textures for all prepared LOD models where meshes belong to this category
            preparedModels.forEach((model) => {
                if (model.type !== "lod") return;
                const lowestLODMap = model.LODMaps[model.LODMaps.length - 1];
                // for every mesh in lowestLODMap belonging to category, set its current lod (active or default)
                Object.values(lowestLODMap).forEach((mesh) => {
                    const cat = meshToCategory[mesh.name];
                    if (cat !== category) return;
                    // if this mesh is currently active (i.e. model.activeMeshName === mesh.name),
                    // apply texture with model.activeLOD; otherwise apply default lowest LOD
                    if (model.activeMeshName === mesh.name && model.activeLOD != null) {
                        const aname=model.LODMaps[model.activeLOD][mesh.name]
                        applyCategoryMaterialToMesh({mesh:aname, dofEffectDistance});
                    } else {
                        applyCategoryMaterialToMesh({mesh, dofEffectDistance});
                    }
                });
            });
        };

        window.addEventListener("material-change", onMaterialChange);
        return () => window.removeEventListener("material-change", onMaterialChange);
    }, [preparedModels, meshToCategory]);

    // ------------------------------------------------------------
    // LOD SWITCHING (model LOD + texture LOD sync)
    // ------------------------------------------------------------
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

            // find closest mesh (using precomputed bbox)
            Object.values(lowestLODMap).forEach((mesh) => {
                const worldBox = mesh._bbox.clone().applyMatrix4(mesh.matrixWorld);
                worldBox.clampPoint(camPos, tmp);
                const dist = camPos.distanceTo(tmp);
                if (dist < minDist) {
                    minDist = dist;
                    closestMeshName = mesh.name;
                }
            });

            setDofEffectDistance(minDist)
            // Smooth DOF fade in/out
            const target = minDist < 3 ? 1 : 0;
            setDofFade((prev) => THREE.MathUtils.lerp(prev, target, 0.8));

            if (!closestMeshName) return;

            // choose lod index based on thresholds
            let newLODIndex = thresholds.length - 1;
            for (let i = 0; i < thresholds.length; i++) {
                if (minDist < thresholds[i]) {
                    newLODIndex = i;
                    break;
                }
            }

            // skip if nothing changed
            if (model.activeMeshName === closestMeshName && model.activeLOD === newLODIndex) return;

            // remove previous active mesh (if any) and restore its lowest LOD mesh
            if (model.activeMeshName != null && model.activeLOD != null) {
                const prevMesh = LODMaps[model.activeLOD][model.activeMeshName];
                if (prevMesh && prevMesh.parent === group) group.remove(prevMesh);

                const lowMesh = lowestLODMap[model.activeMeshName];
                if (lowMesh && !lowMesh.parent) group.add(lowMesh);

                // also reapply the category's texture at default LOD for the restored mesh
                const cat = meshToCategory[model.activeMeshName];
                if (cat && model.activeMeshName!=closestMeshName) {
                    applyCategoryMaterialToMesh({mesh:lowMesh},true);
                }
            }

            // remove the low LOD of new focused mesh
            const lowMesh = lowestLODMap[closestMeshName];
            if (lowMesh && lowMesh.parent === group) group.remove(lowMesh);

            // add the new mesh (model LOD)
            const newMesh = LODMaps[newLODIndex][closestMeshName];
            if (newMesh) {
                applyCategoryMaterialToMesh({mesh:newMesh, minDist});
                group.add(newMesh);
            }

            model.activeMeshName = closestMeshName;
            model.activeLOD = newLODIndex;

            console.log(
                {
                    "Active Model Lod:-": model.activeLOD,
                    "Active Mesh name:-": model.activeMeshName
                }
            );
        });
    });

    return (
        <>
            <group ref={rootRef} />;
            <MeasurementLabels scene={rootRef.current} showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}/>
            {dofEffectDistance < 0.7 && <Effects dofEffectDistance={dofEffectDistance} />}
            {/* <Effects
        dofEffectDistance={dofEffectDistance}
        dofFade={dofFade}
      /> */}

        </>
    )

};

// ------------------------------------------------------------
// TRANSFORMS (unchanged)
// ------------------------------------------------------------
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