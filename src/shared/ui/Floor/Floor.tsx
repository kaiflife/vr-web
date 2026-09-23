import { RigidBody } from "@react-three/rapier";
import { TeleportTarget } from "@react-three/xr";
import React from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useGameStore } from "@/entities";

interface FloorProps {
  isTeleportable?: boolean;

  size: [number, number];
  position: [number, number, number]; // [x, y, z]
  rotation: ThreeElements["object3D"]["rotation"];
}

export function Floor({
  isTeleportable = true,
  size,
  position,
  rotation,
}: FloorProps): React.JSX.Element {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  const floorMesh = (
    <mesh>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#37474F" />
    </mesh>
  );

  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      {isTeleportable ? (
        <TeleportTarget onTeleport={setPlayerPosition}>
          {floorMesh}
        </TeleportTarget>
      ) : (
        floorMesh
      )}
    </RigidBody>
  );
}
