import React from "react";
import { Level1, Level2 } from "@/pages";
import type { LevelType } from "@/entities";

export const LEVEL_COMPONENTS: Record<LevelType, React.ComponentType> = {
  level1: Level1,
  level2: Level2,
};
