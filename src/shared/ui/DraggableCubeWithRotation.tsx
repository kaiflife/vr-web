import React, { useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

export function DraggableCubeWithRotation(): React.JSX.Element {
  const rbRef = useRef<RapierRigidBody>(null);
  const [physicsType, setPhysicsType] = useState<
    "dynamic" | "kinematicPosition"
  >("dynamic");

  const [holdingHand, setHoldingHand] = useState<"left" | "right" | null>(null);

  const leftController = useXRInputSourceState("controller", "left");
  const rightController = useXRInputSourceState("controller", "right");

  const activeControllerState =
    holdingHand === "right" ? rightController : leftController;

  // Выделяем память под структуры Three.js один раз во избежание фризов GC
  const controllerQuaternion = useRef(new THREE.Quaternion());
  const rotationOffset = useRef(new THREE.Quaternion());
  const finalQuaternion = useRef(new THREE.Quaternion());

  const controllerPosition = useRef(new THREE.Vector3());
  const localPositionOffset = useRef(new THREE.Vector3());
  const finalPosition = useRef(new THREE.Vector3());

  const handleSelectStart = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    if (!rbRef.current) return;

    // определяем руку из WebXR-события v6
    const hand = (event.nativeEvent as any).inputSource?.handedness || "right";

    // Выбираем нужный контроллер напрямую из стейта библиотеки
    const currentControllerState =
      hand === "right" ? rightController : leftController;
    if (!currentControllerState || !currentControllerState.object) return;

    setHoldingHand(hand);
    setPhysicsType("kinematicPosition");

    const xrObject = currentControllerState.object; // Это настоящий THREE.Group контроллера

    // Считываем честные трансформации контроллера
    xrObject.getWorldQuaternion(controllerQuaternion.current);
    xrObject.getWorldPosition(controllerPosition.current);

    const cubePos = rbRef.current.translation();
    const cubeRot = rbRef.current.rotation();

    const currentCubePosition = new THREE.Vector3(
      cubePos.x,
      cubePos.y,
      cubePos.z,
    );
    const currentCubeQuaternion = new THREE.Quaternion(
      cubeRot.x,
      cubeRot.y,
      cubeRot.z,
      cubeRot.w,
    );

    // Вычисляем смещения
    rotationOffset.current
      .copy(controllerQuaternion.current)
      .invert()
      .multiply(currentCubeQuaternion);
    localPositionOffset.current
      .copy(currentCubePosition)
      .sub(controllerPosition.current)
      .applyQuaternion(controllerQuaternion.current.clone().invert());

    event.target.setPointerCapture(event.pointerId);
  };

  // 2. ОБНОВЛЕНИЕ КАЖДЫЙ КАДР
  useFrame(() => {
    if (
      !holdingHand ||
      !activeControllerState ||
      !activeControllerState.object ||
      !rbRef.current
    )
      return;

    const xrObject = activeControllerState.object;

    // Считываем мировое вращение и позицию из шлема
    xrObject.getWorldQuaternion(controllerQuaternion.current);
    xrObject.getWorldPosition(controllerPosition.current);

    // ВРАЩЕНИЕ
    finalQuaternion.current
      .copy(controllerQuaternion.current)
      .multiply(rotationOffset.current);
    rbRef.current.setNextKinematicRotation(finalQuaternion.current);

    // ПОЗИЦИЯ
    finalPosition.current
      .copy(localPositionOffset.current)
      .applyQuaternion(controllerQuaternion.current)
      .add(controllerPosition.current);

    rbRef.current.setNextKinematicTranslation(finalPosition.current);
  });

  // 3. КОНЕЦ ЗАХВАТА
  const handleSelectEnd = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();

    if (holdingHand) {
      setHoldingHand(null);
      setPhysicsType("dynamic");

      event.nativeEvent.target.setPointerCapture(event.pointerId);

      if (rbRef.current) {
        rbRef.current.resetForces(true);
        rbRef.current.resetTorques(true);
        rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
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
        pointerEvents="auto"
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={"#FF5722"}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </RigidBody>
  );
}
