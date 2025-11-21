// getterMappedDatafunctions.js
import { data } from "./data";

/**
 * Return flat array of all GLB model paths (unchanged).
 */
export function getModelPaths() {
  const paths = [];

  Object.values(data.models).forEach((model) => {
    if (model.lods && Array.isArray(model.lods)) {
      model.lods.forEach((lod) => {
        if (lod.modelPath) paths.push(lod.modelPath);
      });
    } else if (model.modelPath) {
      paths.push(model.modelPath);
    }
  });

  return paths;
}

/**
 * Return materials grouped by category (for UI)
 * Example return:
 * [ { Leather: [ { id, name, imagePath }, ... ] }, { Wood: [...] } ]
 */
export function getMaterialsByCategories() {
  const categoryMap = {};

  const materials = data.models.Sofa.materialsLods || [];

  materials.forEach((material) => {
    const categories = (material.materialUsingCategories?.categoriesNames) || [];
    const image = material.materialUsingCategories?.materialImagePath || "";

    categories.forEach((category) => {
      if (!categoryMap[category]) categoryMap[category] = [];
      // store id + name + imagePath for UI
      categoryMap[category].push({
        id: material.id,
        materialName: material.materialName,
        imagePath: image,
      });
    });
  });

  return Object.entries(categoryMap).map(([k, v]) => ({ [k]: v }));
}

/**
 * Return ALL texture file paths from data (baseColor, normal, roughness, metallic, displacement).
 * This is used to preload textures.
 * Returns array of unique paths.
 */
export function getMaterialTexturePaths() {
  const paths = new Set();
  const materials = data.models.Sofa.materialsLods || [];

  materials.forEach((material) => {
    const lods = material.materialTexturePaths || {};
    Object.values(lods).forEach((lodMap) => {
      if (!lodMap) return;
      if (lodMap.baseColorPath) paths.add(lodMap.baseColorPath);
      // if (lodMap.normalPath) paths.add(lodMap.normalPath);
      // if (lodMap.roughnessPath) paths.add(lodMap.roughnessPath);
      // if (lodMap.metallicPath) paths.add(lodMap.metallicPath);
      // if (lodMap.displacementPath) paths.add(lodMap.displacementPath);
    });
  });

  return Array.from(paths);
}

/**
 * Small helper: find material entry by id
 */
export function getMaterialById(id) {
  return (data.models.Sofa.materialsLods || []).find((m) => m.id === String(id)) || null;
}
