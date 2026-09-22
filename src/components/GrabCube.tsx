import React, { useRef, useState } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";

export default function GrabCube(): React.JSX.Element {
  const rbRef = useRef<RapierRigidBody>(null);
  const isHolding = useRef<boolean>(false);

  const [physicsType, setPhysicsType] = useState<
    "dynamic" | "kinematicPosition"
  >("dynamic");

  const handleSelectStart = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    isHolding.current = true;
    setPhysicsType("kinematicPosition");
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>): void => {
    if (isHolding.current && rbRef.current && event.point) {
      // Метод setNextKinematicTranslation остается прежним
      rbRef.current.setNextKinematicTranslation({
        x: event.point.x,
        y: event.point.y,
        z: event.point.z,
      });
    }
  };

  const handleSelectEnd = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    if (isHolding.current) {
      isHolding.current = false;
      setPhysicsType("dynamic");

      if (rbRef.current) {
        rbRef.current.resetForces(true);
        rbRef.current.resetTorques(true);
      }
    }
  };

  return (
    <RigidBody
      ref={rbRef}
      type={physicsType}
      position={[0, 1.5, -1.5]}
      colliders="cuboid"
    >
      <mesh
        onPointerDown={handleSelectStart}
        onPointerMove={handlePointerMove}
        onPointerUp={handleSelectEnd}
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#FF5722" />
      </mesh>
    </RigidBody>
  );
}
