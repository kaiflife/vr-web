import {
  Platform,
  PLATFORM_HORIZONTAL_ROTATION,
  Table,
  DraggableCubeWithRotation,
  TriggerZone,
  StaticText,
} from "@/feature";
import { useState, type JSX } from "react";

const CUBE_NAME = "cube-level1";

const TRIGGER_ITEMS = new Set([CUBE_NAME]);

const CUBE_POSITION: [number, number, number] = [0.3, 1.5, -1.5];

export function Level1(): JSX.Element {
  const [activeCubes, setActiveCubes] = useState<string[]>([]);

  const handleCubesChange = (cubes: string[]) => {
    setActiveCubes(cubes);

    if (cubes.includes(CUBE_NAME)) {
      console.log("ЗАГАДКА РЕШЕНА! Оба куба на месте.");
    }
  };

  const triggerDeadZone = (cubes: string[], rigidBody) => {
    if (cubes.includes(CUBE_NAME)) {
      rigidBody.setTranslation(
        { x: CUBE_POSITION[0], y: CUBE_POSITION[1], z: CUBE_POSITION[2] },
        true,
      );
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
        triggerNames={TRIGGER_ITEMS}
        soundPath="/sounds/success.mp3"
      />
      <TriggerZone
        position={[-0.2, -2, -1.5]}
        size={[20, 0.1, 20]}
        color="red"
        onActiveCubesChange={triggerDeadZone}
        triggerNames={TRIGGER_ITEMS}
        soundPath="/sounds/resetPosition.mp3"
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
      <DraggableCubeWithRotation position={[-1, -1, -1]} name={CUBE_NAME} />
    </group>
  );
}
