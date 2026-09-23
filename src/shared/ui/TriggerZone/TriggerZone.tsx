import { PositionalAudio } from "@react-three/drei";
import {
  RigidBody,
  type IntersectionEnterPayload,
  type IntersectionExitPayload,
} from "@react-three/rapier";
import React, { useRef, useState } from "react";
import * as THREE from "three";

interface TriggerZoneProps {
  position: [number, number, number];
  size: [number, number, number]; // [ширина, высота, длина] зоны триггера
  onActiveCubesChange?: (cubeNames: string[]) => void; // Колбэк, передающий список кубов внутри
  soundPath?: string;
}

const DEFAULT_ZONE_SOUNDS = "/sounds/success.mp3";

export function TriggerZone({
  position,
  size,
  onActiveCubesChange,
  soundPath = DEFAULT_ZONE_SOUNDS, // Задаем дефолтное значение
}: TriggerZoneProps): React.JSX.Element {
  const [itemsInZone, setItemsInZone] = useState<Set<string>>(new Set());

  const audioRefs = useRef<THREE.PositionalAudio | null>(null);

  const handleIntersectionEnter = (event: IntersectionEnterPayload) => {
    // Получаем имя объекта, который зашел в триггер (зададим его на кубах)
    const targetName = event.other.rigidBodyObject?.name;

    if (targetName && targetName.startsWith("cube-")) {
      const audioNode = audioRefs.current;

      if (audioNode) {
        if (audioNode.isPlaying) audioNode.stop();
        audioNode.setVolume(0.6);
        audioNode.play();
      }

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

      <PositionalAudio
        key={soundPath}
        url={soundPath}
        ref={(el) => {
          audioRefs.current = el;
        }}
        distance={2}
        loop={false}
      />
    </RigidBody>
  );
}
