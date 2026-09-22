import type { ThreeEvent } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import React from "react";

interface FloorProps {
  onTeleport: (targetPosition: [number, number, number]) => void;
}

export default function Floor({ onTeleport }: FloorProps): React.JSX.Element {
  const handleFloorClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (event.point) {
      onTeleport([event.point.x, 0, event.point.z]);
    }
  };

  return (
    <RigidBody type="fixed">
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleFloorClick}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
    </RigidBody>
  );
}
