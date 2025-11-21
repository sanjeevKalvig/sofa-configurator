import * as THREE from 'three'
import { getMaterialTexturePaths } from '../config/getterMappedDatafunctions'

const textureLoader = new THREE.TextureLoader()
const textureCache = {}

const texturePaths = getMaterialTexturePaths()

// ✅ Preload and return a Promise
export function preloadTextures() {
  return Promise.all(
    texturePaths.map(
      (path, index) =>
        new Promise((resolve, reject) => {
          if (textureCache[path]) {
            resolve(textureCache[path])
          } else {
            textureLoader.load(
              path,
              (tex) => {
                // Use sRGB for color maps (heuristic: filename includes BaseColor or Albedo)
                // if (/BaseColor|Albedo|basecolor|albedo/i.test(path)) {
                //   tex.encoding = THREE.sRGBEncoding;
                // }
                textureCache[path] = tex
                resolve(tex)
              },
              undefined,
              (err) => reject(err)
            )
          }
        })
    )
  )
}

export function getTexture(path) {
  return textureCache[path] || null
}
