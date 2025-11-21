import React from "react"
import { EffectComposer, Vignette, Bloom, HueSaturation, DepthOfField } from "@react-three/postprocessing"

export default function Effects({dofEffectDistance}) {
  return (
    <EffectComposer >
      <DepthOfField
        worldFocusDistance={dofEffectDistance}
        focalLength={0.2}
        bokehScale={8}
        height={1080}
      />
      {/* <Bloom luminanceThreshold={0.45} radius={0.6} levels={1} intensity={0.3} mipmapBlur />

      <Vignette offset={0.3} darkness={0.55} eskil={false} />
      <HueSaturation hue={0.1} saturation={0.2} /> */}
    </EffectComposer>
  )
}



// import React from "react"
// import { EffectComposer, DepthOfField } from "@react-three/postprocessing"

// export default function Effects({ dofEffectDistance, dofFade }) {

//   // You can multiply ANY parameter by dofFade
//   const scaledBokeh = 8 * dofFade;
//   const scaledFocalLength = 1 * dofFade;

//   return (
//     <EffectComposer>
//       <DepthOfField
//         worldFocusDistance={dofEffectDistance}
//         focalLength={scaledFocalLength}
//         bokehScale={scaledBokeh}
//         height={1080}
//       />
//     </EffectComposer>
//   )
// }
