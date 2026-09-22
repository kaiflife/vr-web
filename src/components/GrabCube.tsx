import React, { useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";

export default function GrabCube(): React.JSX.Element {
  const rbRef = useRef<RapierRigidBody>(null);
  const [physicsType, setPhysicsType] = useState<
    "dynamic" | "kinematicPosition"
  >("dynamic");
  const isHolding = useRef<boolean>(false);

  const handleSelectStart = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();

    if (!rbRef.current) return;

    isHolding.current = true;
    setPhysicsType("kinematicPosition"); // Отключаем гравитацию

    if (event.nativeEvent.target instanceof Element) {
      event.nativeEvent.target.setPointerCapture(event.pointerId);
    }
  };

  // 2. Стандартное движение луча внутри захвата
  const handlePointerMove = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();

    if (!isHolding.current || !rbRef.current || !event.point) return;

    // Переносим физическое тело куба строго в точку, куда указывает лазер
    rbRef.current.setNextKinematicTranslation({
      x: event.point.x,
      y: event.point.y,
      z: event.point.z,
    });
  };

  // 3. Срабатывает строго в момент отпускания триггера
  const handleSelectEnd = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();

    if (isHolding.current) {
      isHolding.current = false;
      setPhysicsType("dynamic"); // Включаем гравитацию обратно

      if (event.nativeEvent.target instanceof Element) {
        event.nativeEvent.target.setPointerCapture(event.pointerId);
      }

      if (rbRef.current) {
        // Гасим импульсы, чтобы куб не улетал при падении
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
        onPointerUp={handleSelectEnd}
        onPointerMove={handlePointerMove}
        pointerEvents="auto"
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#FF5722" roughness={0.2} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}
