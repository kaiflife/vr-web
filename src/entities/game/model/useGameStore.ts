import { create } from "zustand";
import * as THREE from "three";
import { soundManager } from "@/shared";

export type LevelType = "level0" | "level1" | "level2";

interface GameState {
  playerPosition: THREE.Vector3;
  setPlayerPosition: (position: THREE.Vector3) => void;

  currentLevel: LevelType;
  changeLevel: (level: LevelType) => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerPosition: new THREE.Vector3(0, 0, 0),
  currentLevel: "level0",

  setPlayerPosition: (position) => set({ playerPosition: position }),

  changeLevel: (level) => {
    set({
      currentLevel: level,
      playerPosition: new THREE.Vector3(0, 0, 0),
    });

    soundManager.play("levelChange");
  },
}));
