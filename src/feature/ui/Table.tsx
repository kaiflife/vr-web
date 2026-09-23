import React from "react";
import { RigidBody } from "@react-three/rapier";

interface TableProps {
  position?: [number, number, number]; // Позиция стола в сцене [X, Y, Z] (по умолчанию [0, 0, -1.5])
  size?: [number, number, number]; // Размеры стола [ширина, высота, глубина] (по умолчанию [1.2, 0.9, 0.8])
  name: string;
}

export function Table({
  position = [0, 0, -1.5],
  size = [1.2, 0.5, 0.8],
  name,
}: TableProps): React.JSX.Element {
  const [width, height, depth] = size;

  return (
    <RigidBody
      type="fixed"
      name={name}
      position={[position[0], position[1] + height / 2, position[2]]}
    >
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#78909C" />
      </mesh>
    </RigidBody>
  );
}
