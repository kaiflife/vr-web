import { Suspense, useRef, type JSX } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type {
  CollisionEnterPayload,
  RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { PositionalAudio } from "@react-three/drei";
import { SOUNDS, useGrabable } from "@/shared";

interface IInteractiveCube {
  name: string;
  position: ThreeElements["object3D"]["position"];
  initialPosition: ThreeElements["object3D"]["position"];
  color: string;
}

const MATERIAL_SOUNDS = {
  floor: SOUNDS.cubeDrop2,
  nextLevel: SOUNDS.levelChange,
  table: SOUNDS.cubeDrop2,
  player: SOUNDS.grab,
} as const;

export function InteractiveCube({
  name,
  position,
  initialPosition,
  color,
}: IInteractiveCube): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const audioRefs = useRef<Record<string, THREE.PositionalAudio | null>>({});
  const rbRef = useRef<RapierRigidBody>(null);

  useGrabable({
    meshRef,
    rbRef,
    maxDistance: 1,
    onGrab: () => audioRefs.current.player?.play(),
  });

  const handleCollision = (event: CollisionEnterPayload) => {
    const collisionTargetName = event.other.rigidBodyObject?.name;

    if (collisionTargetName && collisionTargetName in MATERIAL_SOUNDS) {
      const audioNode = audioRefs.current[collisionTargetName];

      if (audioNode && !audioNode.isPlaying) audioNode.play();
    }
  };

  return (
    <RigidBody
      ref={rbRef}
      type={"dynamic"}
      position={position}
      userData={{ initialPosition }}
      name={name}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[0.15, 0.15, 0.15]} />
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
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
