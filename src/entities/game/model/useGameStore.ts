import { create } from "zustand";
import * as THREE from "three";
import { soundManager, TeleportRegistry } from "@/shared";

export type LevelType = "level0" | "level1" | "level2";

// Задаем координаты центров финишных платформ для каждого уровня
export const LEVEL_FINISHES: Record<
  LevelType,
  [number, number, number] | null
> = {
  level0: [0, 0.001, 1.25],
  level1: [3.5, 0.001, -5.0],
  level2: null,
};
// Радиус платформы (размер 0.5 означает, что от центра до края 0.25м)
// Дадим игроку небольшой запас, например 0.35м
const FINISH_RADIUS = 0.35;

const _playerXZ = new THREE.Vector2();
const _finishXZ = new THREE.Vector2();

interface GameState {
  playerPosition: THREE.Vector3;
  setPlayerPosition: (position: THREE.Vector3) => void;

  currentLevel: LevelType;
  changeLevel: (level: LevelType) => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerPosition: new THREE.Vector3(0, 0, 0),
  currentLevel: "level0",

  setPlayerPosition: (position) => {
    let shouldChangeLevel = false;
    let nextLevelName: LevelType = "level0";

    set((state) => {
      state.playerPosition.copy(position);

      // 🚀 ПРОВЕРКА ФИНИША ПОСЛЕ ТЕЛЕПОРТА
      const finishPos = LEVEL_FINISHES[state.currentLevel];

      if (finishPos) {
        _playerXZ.set(state.playerPosition.x, state.playerPosition.z);
        _finishXZ.set(finishPos[0], finishPos[2]);

        // Считаем расстояние между игроком и центром платформы
        if (_playerXZ.distanceTo(_finishXZ) <= FINISH_RADIUS) {
          shouldChangeLevel = true;

          // Логика определения следующего уровня
          if (state.currentLevel === "level0") nextLevelName = "level1";
          if (state.currentLevel === "level1") nextLevelName = "level2";
        }
      }

      return { playerPosition: state.playerPosition };
    });

    // Воспроизводим звуки в зависимости от того, шагнул он просто так или прошел уровень
    if (shouldChangeLevel) {
      // Вызываем экшен смены уровня, который у вас уже написан
      useGameStore.getState().changeLevel(nextLevelName);
    } else {
      soundManager.play("teleport");
    }
  },

  changeLevel: (level) => {
    set((state) => {
      // Сбрасываем позицию в ноль без выделения новой памяти
      state.playerPosition.set(0, 0, 0);

      TeleportRegistry.clear();

      return {
        currentLevel: level,
        playerPosition: state.playerPosition,
      };
    });

    soundManager.play("levelChange");
  },
}));
