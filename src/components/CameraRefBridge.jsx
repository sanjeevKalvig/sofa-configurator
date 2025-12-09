import { useThree } from "@react-three/fiber";

export function CameraRefBridge({ cameraRef }) {
    const { camera } = useThree();
    cameraRef.current = camera;
    return null;
  }
  