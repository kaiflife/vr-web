import { soundManager } from "@/shared";
import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";

export function SceneLight(): React.JSX.Element {
  const { camera } = useThree();

  useEffect(() => {
    soundManager.init(camera);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
    </>
  );
}
