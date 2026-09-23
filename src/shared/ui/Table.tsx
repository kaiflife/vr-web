import React from "react";
import { RigidBody } from "@react-three/rapier";

export function Table(): React.JSX.Element {
  return (
    <RigidBody type="fixed">
      <mesh position={[0, 0.45, -1.5]}>
        <boxGeometry args={[1.2, 0.9, 0.8]} />
        <meshStandardMaterial color="#78909C" />
      </mesh>
    </RigidBody>
  );
}
