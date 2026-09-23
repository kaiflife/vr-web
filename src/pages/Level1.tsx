import {
  Floor,
  FLOOR_HORIZONTAL_ROTATION,
  Table,
  DraggableCubeWithRotation,
} from "@/shared";
import { type JSX } from "react";

export function Level1(): JSX.Element {
  return (
    <>
      <Floor
        isTeleportable
        size={[5, 5]}
        position={[0, 0, -1.5]}
        rotation={FLOOR_HORIZONTAL_ROTATION}
      />
      <Table />
      <DraggableCubeWithRotation />
    </>
  );
}
