import {
  RigidBody,
  type IntersectionEnterPayload,
  type IntersectionExitPayload,
} from "@react-three/rapier";
import React, { useState } from "react";

interface TriggerZoneProps {
  position: [number, number, number];
  size: [number, number, number]; // [ширина, высота, длина] зоны триггера
  onActiveCubesChange?: (cubeNames: string[]) => void; // Колбэк, передающий список кубов внутри
}

export function TriggerZone({
  position,
  size,
  onActiveCubesChange,
}: TriggerZoneProps): React.JSX.Element {
  const [itemsInZone, setItemsInZone] = useState<Set<string>>(new Set());

  const handleIntersectionEnter = (event: IntersectionEnterPayload) => {
    // Получаем имя объекта, который зашел в триггер (зададим его на кубах)
    const targetName = event.other.rigidBodyObject?.name;

    if (targetName && targetName.startsWith("cube-")) {
      setItemsInZone((prev) => {
        const next = new Set(prev).add(targetName);
        if (onActiveCubesChange) onActiveCubesChange(Array.from(next));
        return next;
      });
    }
  };

  const handleIntersectionExit = (event: IntersectionExitPayload) => {
    const targetName = event.other.rigidBodyObject?.name;

    if (targetName) {
      setItemsInZone((prev) => {
        const next = new Set(prev);
        next.delete(targetName);
        if (onActiveCubesChange) onActiveCubesChange(Array.from(next));
        return next;
      });
    }
  };

  return (
    // type="fixed" + sensor делает тело неосязаемым триггером
    <RigidBody
      type="fixed"
      position={position}
      sensor
      onIntersectionEnter={handleIntersectionEnter}
      onIntersectionExit={handleIntersectionExit}
    >
      <mesh>
        <boxGeometry args={size} />
        {/* Делаем зону слегка видимой зеленоватой для отладки, потом можно убрать (visible={false}) */}
        <meshBasicMaterial
          color="#00ff00"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </RigidBody>
  );
}
