import { RigidBody } from "@react-three/rapier";
import React, { useEffect, useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { Mesh } from "three";
import { TeleportRegistry } from "@/shared";

interface PlatformProps {
  isTeleportable?: boolean;
  size: [number, number];
  position: [number, number, number];
  rotation: ThreeElements["object3D"]["rotation"];
  name: string;
  soundPath?: string;
  color?: string;
}

export function Platform({
  isTeleportable = true,
  size,
  position,
  color = "#37474F",
  name,
  rotation,
}: PlatformProps): React.JSX.Element {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    // Если платформа не предназначена для телепортации, вообще не вносим её в реестр
    if (!isTeleportable) return;

    const mesh = meshRef.current;
    if (!mesh) return;

    // 🚀 ТЕПЕРЬ РАБОТАЕТ: Регистрируем этот меш в глобальном списке
    TeleportRegistry.add(mesh);

    return () => {
      TeleportRegistry.remove(mesh);
    };
  }, [isTeleportable]); // Добавили в зависимости для надежности

  return (
    <RigidBody type="fixed" name={name} position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
    </RigidBody>
  );
}
