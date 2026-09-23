import React from "react";
import { Level0, Level1, Level2 } from "@/pages";
import type { LevelType } from "@/entities";

export const LEVEL_COMPONENTS: Record<LevelType, React.ComponentType> = {
  level0: Level0,
  level1: Level1,
  level2: Level2,
};
