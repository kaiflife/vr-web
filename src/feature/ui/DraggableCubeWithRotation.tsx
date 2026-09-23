import { Suspense, useRef, useState, type JSX } from "react";
import type { ThreeElements, ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { RigidBody } from "@react-three/rapier";
import type {
  CollisionEnterPayload,
  RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { PositionalAudio } from "@react-three/drei";

interface IDraggableCubeWithRotation {
  name: string;
  position: ThreeElements["object3D"]["position"];
}

const MATERIAL_SOUNDS = {
  floor: "/sounds/cubeDrop2.mp3",
  table: "/sounds/cubeDrop2.mp3",
} as const;

export function DraggableCubeWithRotation({
  name,
  position,
}: IDraggableCubeWithRotation): JSX.Element {
  const audioRefs = useRef<Record<string, THREE.PositionalAudio | null>>({});

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

  const handleCollision = (event: CollisionEnterPayload) => {
    // 1. Определяем имя объекта, с которым столкнулся куб
    const collisionTargetName = event.other.rigidBodyObject?.name;

    // Проверяем, есть ли у нас звук для этой поверхности
    if (collisionTargetName && collisionTargetName in MATERIAL_SOUNDS) {
      const hitVelocity = event.target.rigidBody?.linvel();

      if (hitVelocity) {
        // 2. Считаем силу удара
        const speed = Math.sqrt(
          hitVelocity.x ** 2 + hitVelocity.y ** 2 + hitVelocity.z ** 2,
        );

        // Играем звук только при достаточно сильном ударе
        if (speed > 0.4) {
          // Находим аудио-ноду строго по имени столкнувшегося объекта
          const audioNode = audioRefs.current[collisionTargetName];

          if (audioNode) {
            if (audioNode.isPlaying) audioNode.stop();

            // Динамически настраиваем громкость от скорости падения
            const volume = Math.min(speed / 4, 1.0);
            audioNode.setVolume(volume);

            audioNode.play();
          }
        }
      }
    }
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
      position={position}
      colliders="cuboid"
      name={name}
      onCollisionEnter={handleCollision}
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
      <Suspense fallback={null}>
        {Object.entries(MATERIAL_SOUNDS).map(([surfaceName, url]) => (
          <PositionalAudio
            key={surfaceName}
            url={url}
            ref={(el) => {
              audioRefs.current[surfaceName] = el;
            }}
            distance={1.5}
            loop={false}
          />
        ))}
      </Suspense>
    </RigidBody>
  );
}
