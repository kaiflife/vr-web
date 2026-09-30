import {
  LEVEL_FINISHES,
  Platform,
  PLATFORM_HORIZONTAL_ROTATION,
  StaticText,
} from "@/entities";

export function Level0() {
  const finishPosition = LEVEL_FINISHES.level0;

  if (!finishPosition) return null;

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
        name="nextLevel"
        isTeleportable
        size={[0.5, 0.5]}
        position={finishPosition}
        rotation={PLATFORM_HORIZONTAL_ROTATION}
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
