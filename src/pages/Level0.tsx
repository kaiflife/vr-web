import { useGameStore } from "@/entities";
import { Platform, PLATFORM_HORIZONTAL_ROTATION, StaticText } from "@/feature";
import { type JSX } from "react";

export function Level0(): JSX.Element {
  const changeLevel = useGameStore((state) => state.changeLevel);

  return (
    <group>
      <Platform
        name="floor"
        isTeleportable
        size={[5, 5]}
        position={[0, 0, -1.5]}
        rotation={PLATFORM_HORIZONTAL_ROTATION}
      />
      <Platform
        name="floor"
        isTeleportable
        size={[0.5, 0.5]}
        position={[0, 0.001, 1.25]}
        rotation={PLATFORM_HORIZONTAL_ROTATION}
        onTeleport={() => {
          changeLevel("level1");
        }}
        color="white"
      />
      <StaticText
        position={[0, 1, -4]}
        text={`Зажмите указательный курок для телепорта.
          Для перехода на след уровень необходимо встать на белый квадрат`}
      />
    </group>
  );
}
