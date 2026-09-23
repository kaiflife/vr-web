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

const CUBE_POSITION: [number, number, number] = [0, 1.5, -1.5];

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
        size={[2, 2]}
        position={[0, 0, -1.5]}
        rotation={PLATFORM_HORIZONTAL_ROTATION}
      />
      <Platform
        name="floor"
        isTeleportable
        size={[2, 2]}
        position={[-4, 0, -1.5]}
        rotation={PLATFORM_HORIZONTAL_ROTATION}
      />
      <TriggerZone
        visible
        position={[-4, 0.1, -1.5]}
        size={[0.3, 0.2, 0.3]}
        color="red"
        onTrigger={handleCubesChange}
        triggerNames={TRIGGER_ITEMS}
        soundPath="/sounds/success.mp3"
      />
      <DeadZone triggerNames={TRIGGER_ITEMS} />
      <StaticText
        position={[0, 1, -4]}
        text={"Перенесите куб на триггер-зону."}
      />
      <StaticText
        position={[-1.98, 1.5, -1.5]}
        rotation={[0, Math.PI / 2, 0]}
        text={
          "Если вы уронили куб, ничего страшного, он волшебным образом попытается вернутся обратно."
        }
      />
      <Table position={[-2, 0, -0.5]} name={"table"} size={[0.01, 5, 1]} />
      <Table position={[-2, 0, -2.5]} name={"table"} size={[0.01, 5, 1]} />
      <Table position={[-2, 1, -1.5]} name={"table"} size={[0.01, 5, 3]} />
      <Table position={[-2, 0, -1.5]} name={"table"} size={[0.01, 0.5, 3]} />
      <DraggableCubeWithRotation
        color={"red"}
        position={CUBE_POSITION}
        initialPosition={CUBE_POSITION}
        name={CUBE_NAME}
      />
    </group>
  );
}
