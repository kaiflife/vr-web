import { RigidBody } from "@react-three/rapier";
import React from "react";
import type { ThreeElements } from "@react-three/fiber";

interface PlatformProps {
  isTeleportable?: boolean;
  size: [number, number];
  position: [number, number, number];
  rotation: ThreeElements["object3D"]["rotation"];
  name: string;
  soundPath?: string;
  color?: string;
}

export function Platform({
  isTeleportable = true,
  size,
  position,
  color = "#37474F",
  name,
  rotation,
}: PlatformProps): React.JSX.Element {
  return (
    <RigidBody type="fixed" name={name} position={position} rotation={rotation}>
      <mesh userData={{ isTeleportable }}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
