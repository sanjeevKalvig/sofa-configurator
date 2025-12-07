import React from "react"
import { EffectComposer, DepthOfField } from "@react-three/postprocessing"

export default function Effects({ dofEffectDistance }) {
  return (
    <EffectComposer>

      {/** Enable DOF only if distance < 0.7 */}
      {dofEffectDistance !== null && (
        <DepthOfField
          worldFocusDistance={dofEffectDistance}
          focalLength={0.2}
          bokehScale={8}
          height={1080}
        />
      )}

    </EffectComposer>
  )
}
