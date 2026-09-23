// src/shared/ui/StaticTooltip/StaticTooltip.tsx
import React from "react";
import { Text } from "@react-three/drei";

interface StaticTooltipProps {
  position: [number, number, number]; // Координаты в сцене [X, Y, Z]
  text: string; // Текст подсказки (отображается всегда)
  maxWidth?: number; // Максимальная длина/ширина текста (по умолчанию 1.5)
  height?: number; // Высота плашки подложки (по умолчанию 0.5)
  rotation?: [number, number, number]; // Угол поворота по осям [X, Y, Z] в радианах (по умолчанию)
}

export function StaticText({
  position,
  text,
  maxWidth = 1.5,
  height = 0.5,
  rotation,
}: StaticTooltipProps): React.JSX.Element {
  const backgroundWidth = maxWidth + 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* Тёмная подложка-плашка с настраиваемой шириной и высотой */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[backgroundWidth, height]} />
        <meshBasicMaterial color="#111111" transparent opacity={0.7} />
      </mesh>

      <Text
        color="#ffffff"
        fontSize={0.08}
        maxWidth={maxWidth}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
}
