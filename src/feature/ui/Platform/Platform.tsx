import { RigidBody } from "@react-three/rapier";
import { TeleportTarget } from "@react-three/xr";
import React from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useGameStore } from "@/entities";
import * as THREE from "three";
import { soundManager } from "@/shared";

interface PlatformProps {
  isTeleportable?: boolean;
  size: [number, number];
  position: [number, number, number];
  rotation: ThreeElements["object3D"]["rotation"];
  name: string;
  soundPath?: string;
  onTeleport?: () => void;
  color?: string;
  maxTeleportDistance?: number;
}

export function Platform({
  isTeleportable = true,
  size,
  position,
  color = "#37474F",
  name,
  rotation,
  onTeleport,
  maxTeleportDistance = 5,
}: PlatformProps): React.JSX.Element {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  const handleTeleport = (targetPosition: THREE.Vector3) => {
    const playerVector = Array.isArray(playerPosition)
      ? new THREE.Vector3(...playerPosition)
      : (playerPosition as THREE.Vector3);

    const distance = playerVector.distanceTo(targetPosition);

    if (distance > maxTeleportDistance) {
      // todo Добавить изменение цвета для не валидной длины луча телепорта
      return;
    }

    soundManager.play("teleport");
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
        </group>
      ) : (
        platformMesh
      )}
    </RigidBody>
  );
}
