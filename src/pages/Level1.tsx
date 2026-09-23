import {
  Platform,
  PLATFORM_HORIZONTAL_ROTATION,
  Table,
  DraggableCubeWithRotation,
  TriggerZone,
  StaticText,
} from "@/feature";
import { DeadZone } from "@/feature/ui/DeadZone";
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
        visible
        position={[-0.2, 0.6, -1.5]}
        size={[0.3, 0.2, 0.3]}
        color="red"
        onTrigger={handleCubesChange}
        triggerNames={TRIGGER_ITEMS}
        soundPath="/sounds/success.mp3"
      />
      <DeadZone triggerNames={TRIGGER_ITEMS} />
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
      <DraggableCubeWithRotation
        color={"red"}
        position={[-1, -1, -1]}
        initialPosition={CUBE_POSITION}
        name={CUBE_NAME}
      />
    </group>
  );
}
