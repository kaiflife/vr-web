import {
  DraggableCubeWithRotation,
  Floor,
  FLOOR_HORIZONTAL_ROTATION,
  Table,
} from "@/shared";
import { type JSX } from "react";

export function Level2(): JSX.Element {
  return (
    <>
      <Floor
        isTeleportable
        size={[10, 10]}
        position={[0, 0.5, -5]}
        rotation={FLOOR_HORIZONTAL_ROTATION}
      />
      <Table />
      <DraggableCubeWithRotation name={"cube-level2"} />
    </>
  );
}
