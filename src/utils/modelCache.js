import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { getModelPaths } from '../config/getterMappedDatafunctions';


const objLoader = new OBJLoader()

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader);

const modelCache = {}
const modelPaths = getModelPaths()


export function preloadModels() {
  return Promise.all(
    modelPaths.map(
      (path,index)=>
      new Promise((resolve, reject) => {
        if (modelCache[path]) {
          resolve(modelCache[path])
          return
        }
    
        const extension = path.split('.').pop().toLowerCase()
    
        if (extension === 'obj') {
          objLoader.load(
            path,
            (obj) => {
              modelCache[path] = obj
              resolve(obj)
            },
            undefined,
            (err) => reject(err)
          )
        } else if (extension === 'glb' || extension === 'gltf') {
          gltfLoader.load(
            path,
            (gltf) => {
              modelCache[path] = gltf.scene // we only cache the scene
              resolve(gltf.scene)
            },
            undefined,
            (err) => reject(err)
          )
        } else {
          reject(new Error(`Unsupported file format: ${extension}`))
        }
      })
    )
  )
}

export function getModel(path) {
  return modelCache[path] || null
}
