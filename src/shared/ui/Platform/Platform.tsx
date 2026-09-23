import { RigidBody } from "@react-three/rapier";
import { TeleportTarget } from "@react-three/xr";
import React from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useGameStore } from "@/entities";

interface PlatformProps {
  isTeleportable?: boolean;

  size: [number, number];
  position: [number, number, number]; // [x, y, z]
  rotation: ThreeElements["object3D"]["rotation"];
  name: string;
}

export function Platform({
  isTeleportable = true,
  size,
  position,
  name,
  rotation,
}: PlatformProps): React.JSX.Element {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  const platformMesh = (
    <mesh>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#37474F" />
    </mesh>
  );

  return (
    <RigidBody type="fixed" name={name} position={position} rotation={rotation}>
      {isTeleportable ? (
        <TeleportTarget onTeleport={setPlayerPosition}>
          {platformMesh}
        </TeleportTarget>
      ) : (
        platformMesh
      )}
    </RigidBody>
  );
}
