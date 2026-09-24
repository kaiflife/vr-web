import { RigidBody } from "@react-three/rapier";
import { TeleportTarget } from "@react-three/xr";
import React, { useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useGameStore } from "@/entities";
import { PositionalAudio } from "@react-three/drei";
import * as THREE from "three";
import { SOUNDS } from "@/shared";

interface PlatformProps {
  isTeleportable?: boolean;
  size: [number, number];
  position: [number, number, number]; // [x, y, z]
  rotation: ThreeElements["object3D"]["rotation"];
  name: string;
  soundPath?: string; // Кастомный путь к звуку, если нужен
  onTeleport?: () => void;
  color?: string;
}

const DEFAULT_TELEPORT_SOUND = SOUNDS.teleport;

export function Platform({
  isTeleportable = true,
  size,
  position,
  color = "#37474F",
  name,
  rotation,
  soundPath = DEFAULT_TELEPORT_SOUND,
  onTeleport,
}: PlatformProps): React.JSX.Element {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const audioRef = useRef<THREE.PositionalAudio | null>(null);

  const handleTeleport = (targetPosition: THREE.Vector3) => {
    if (audioRef.current) {
      if (audioRef.current.isPlaying) audioRef.current.stop();

      audioRef.current.setVolume(0.6);
      audioRef.current.play();
    }

    setPlayerPosition(targetPosition);
    onTeleport?.();
  };

  const platformMesh = (
    <mesh>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );

  return (
    <RigidBody type="fixed" name={name} position={position} rotation={rotation}>
      {isTeleportable ? (
        <group>
          <TeleportTarget onTeleport={handleTeleport}>
            {platformMesh}
          </TeleportTarget>

          <PositionalAudio
            key={soundPath}
            url={soundPath}
            ref={(el) => {
              audioRef.current = el;
            }}
            distance={5}
            loop={false}
          />
        </group>
      ) : (
        platformMesh
      )}
    </RigidBody>
  );
}
