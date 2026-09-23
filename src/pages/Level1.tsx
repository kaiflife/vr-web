import {
  Platform,
  PLATFORM_HORIZONTAL_ROTATION,
  Table,
  DraggableCubeWithRotation,
  TriggerZone,
  StaticText,
} from "@/shared";
import { useState, type JSX } from "react";

const CUBE_NAME = "cube-level1";

export function Level1(): JSX.Element {
  const [activeCubes, setActiveCubes] = useState<string[]>([]);

  const handleCubesChange = (cubes: string[]) => {
    setActiveCubes(cubes);

    if (cubes.includes(CUBE_NAME)) {
      console.log("ЗАГАДКА РЕШЕНА! Оба куба на месте.");
    }
  };

  return (
    <group>
      <Platform
        name="floor"
        isTeleportable
        size={[5, 5]}
        position={[0, 0, -1.5]}
        rotation={PLATFORM_HORIZONTAL_ROTATION}
      />
      <TriggerZone
        position={[-0.2, 0.6, -1.5]}
        size={[0.3, 0.2, 0.3]}
        onActiveCubesChange={handleCubesChange}
        successName={CUBE_NAME}
      />
      <StaticText
        position={[0, 1, -4]}
        text={
          "Зажмите стик вперед для телепорта.\n\nПеренесите кубы на триггер-зону."
        }
      />
      <StaticText
        position={[2, 1, -4]}
        text={`Активные кубы: ${activeCubes}`}
      />
      <Table name={"table"} />
      <DraggableCubeWithRotation position={[0.3, 1.5, -1.5]} name={CUBE_NAME} />
    </group>
  );
}
