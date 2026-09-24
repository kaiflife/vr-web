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
  position: [number, number, number]; // [x, y, z]
  rotation: ThreeElements["object3D"]["rotation"];
  name: string;
  soundPath?: string; // Кастомный путь к звуку, если нужен
  onTeleport?: () => void;
  color?: string;
}

export function Platform({
  isTeleportable = true,
  size,
  position,
  color = "#37474F",
  name,
  rotation,
  onTeleport,
}: PlatformProps): React.JSX.Element {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  const handleTeleport = (targetPosition: THREE.Vector3) => {
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
