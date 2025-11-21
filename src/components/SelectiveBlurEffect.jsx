// src/components/SelectiveBlurEffect.jsx
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { BokehShader, BokehDepthShader } from "three/examples/jsm/shaders/BokehShader2.js";

export default function SelectiveBlurEffect({
  enabled = true,             // toggle overall effect
  focalDistanceOverride = 0,  // optional: pass a focal distance (meters). 0 = auto
}) {
  const { gl, size, scene, camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  // === create render targets and post scene + ortho camera ===
  const {
    rtColor,
    rtDepth,
    postScene,
    postCamera,
    postQuad,
    depthMaterial,
    bokehMaterial,
  } = useMemo(() => {
    const params = { type: THREE.HalfFloatType, encoding: THREE.sRGBEncoding };
    const rtColor = new THREE.WebGLRenderTarget(size.width, size.height, params);
    const rtDepth = new THREE.WebGLRenderTarget(size.width, size.height, params);

    // orthographic camera + scene for final quad (similar to vanilla)
    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(
      -size.width / 2,
      size.width / 2,
      size.height / 2,
      -size.height / 2,
      0.1,
      10
    );
    postCamera.position.z = 1;

    // plane to draw fullscreen (we will compute UV coords that map from -size..size to 0..1 in shader)
    const geom = new THREE.PlaneGeometry(size.width, size.height);
    const postQuad = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: 0xff00ff }));
    postQuad.frustumCulled = false;
    postScene.add(postCamera);
    postScene.add(postQuad);

    // depth shader material (BokehDepthShader)
    const depthShader = BokehDepthShader;
    const depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);
    const depthMaterial = new THREE.ShaderMaterial({
      uniforms: depthUniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader,
    });
    // set near & far now; will update per frame
    depthMaterial.uniforms["mNear"].value = camera.near;
    depthMaterial.uniforms["mFar"].value = camera.far;

    // Bokeh (composite) material
    const bokehUniforms = THREE.UniformsUtils.clone(BokehShader.uniforms);
    // we'll set tColor / tDepth each frame
    const bokehMaterial = new THREE.ShaderMaterial({
      defines: { RINGS: 3, SAMPLES: 4 },
      uniforms: bokehUniforms,
      vertexShader: BokehShader.vertexShader,
      fragmentShader: BokehShader.fragmentShader,
    });

    return { rtColor, rtDepth, postScene, postCamera, postQuad, depthMaterial, bokehMaterial };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // create once

  // Keep RT sizes in sync with canvas
  useMemo(() => {
    rtColor.setSize(size.width, size.height);
    rtDepth.setSize(size.width, size.height);
    // update post camera and quad geometry
    postCamera.left = -size.width / 2;
    postCamera.right = size.width / 2;
    postCamera.top = size.height / 2;
    postCamera.bottom = -size.height / 2;
    postCamera.updateProjectionMatrix();
    postQuad.geometry.dispose();
    postQuad.geometry = new THREE.PlaneGeometry(size.width, size.height);
  }, [size.width, size.height, rtColor, rtDepth, postCamera, postQuad]);

  // helper: compute focus (center raycast). returns distance or fallback
  function computeAutoFocusDistance() {
    // cast from screen center
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.current.intersectObjects(scene.children, true);
    if (!hits.length) return camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) || 10;
    return hits[0].distance;
  }

  // === frame loop: color pass, depth pass (blur targets), then composite ===
  useFrame(() => {
    if (!enabled) {
      // if effect disabled, let the normal renderer handle rendering (do nothing)
      return;
    }

    // Save original autoClear state and set what we need
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false; // we'll manage clears manually like vanilla sample

    // --- PASS 1 - color pass (room + focused LOD0)
    // show only layers 1 (room) and 2 (focused)
    camera.layers.disableAll();
    camera.layers.enable(1); // room
    camera.layers.enable(2); // focused sofa
    gl.setRenderTarget(rtColor);
    gl.clear(true, true, true);
    gl.render(scene, camera);

    // --- PASS 2 - depth pass (blur source: other sofas in layer 3)
    // show only layer 3
    camera.layers.disableAll();
    camera.layers.enable(3);

    // prepare depth override shader and render to rtDepth
    depthMaterial.uniforms["mNear"].value = camera.near;
    depthMaterial.uniforms["mFar"].value = camera.far;

    // override material for depth pass
    scene.overrideMaterial = depthMaterial;
    gl.setRenderTarget(rtDepth);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    scene.overrideMaterial = null;

    // --- PASS 3 - bokeh/composite pass
    // compute focal depth (auto or override)
    const focalDistance = focalDistanceOverride > 0 ? focalDistanceOverride : computeAutoFocusDistance();

    // map the distance to 'focalDepth' expected by shader:
    // The vanilla sets 'focalDepth' to linearized z. Bokeh shader expects in clip-space? We'll set similar uniforms used by BokehShader2.
    bokehMaterial.uniforms["tColor"].value = rtColor.texture;
    bokehMaterial.uniforms["tDepth"].value = rtDepth.texture;
    bokehMaterial.uniforms["textureWidth"].value = size.width;
    bokehMaterial.uniforms["textureHeight"].value = size.height;
    bokehMaterial.uniforms["znear"].value = camera.near;
    bokehMaterial.uniforms["zfar"].value = camera.far;

    // set focalDepth uniform — the vanilla uses linearized distance in 'focalDepth'
    bokehMaterial.uniforms["focalDepth"].value = focalDistance;
    // set other params (tweak as needed)
    bokehMaterial.uniforms["fstop"].value = 2.2;
    bokehMaterial.uniforms["maxblur"].value = 0.8;
    bokehMaterial.uniforms["bias"].value = 0.5;
    bokehMaterial.uniforms["fringe"].value = 0.7;
    bokehMaterial.uniforms["gain"].value = 2.0;
    bokehMaterial.uniforms["threshold"].value = 0.5;
    // bokehMaterial.uniforms["tNoise"].value = null;
    bokehMaterial.uniforms["dithering"].value = 0.0001;
    bokehMaterial.uniforms["manualdof"].value = false;
    bokehMaterial.uniforms["showFocus"].value = false;
    bokehMaterial.needsUpdate = true;

    // draw final bokeh composite quad to screen (postScene/postCamera)
    postQuad.material = bokehMaterial;
    gl.setRenderTarget(null);
    gl.clear(true, true, true);
    gl.render(postScene, postCamera);

    gl.autoClear = prevAutoClear;
  }, 1); // priority 1 to run after the main scene render in r3f (safe)

  return null;
}
