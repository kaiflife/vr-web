import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR } from "@react-three/xr";

import "./App.css";
import { Physics } from "@react-three/rapier";
import { DEFAULT_CAMERA } from "./constants";
import { ControllerGrabSystem, SceneLight, useGameStore } from "@/entities";
import { LEVEL_COMPONENTS } from "@/app/config/levels";
import { xrStore } from "@/app/model/xtStore";
import { CustomArcTeleport } from "@/features";
import { VRPlayer } from "@/shared";

export default function App(): React.JSX.Element {
  // Реактивно следим только за уровнем, чтобы переключать сцены
  const currentLevel = useGameStore((state) => state.currentLevel);
  // Забираем начальную позицию один раз без постоянной подписки на ререндеры всего App
  const initialPlayerPosition = useGameStore.getState().playerPosition;

  const CurrentLevelComponent = LEVEL_COMPONENTS[currentLevel];

  return (
    <div className="app-container">
      <Canvas camera={DEFAULT_CAMERA}>
        <SceneLight />

        <XR store={xrStore}>
          <ControllerGrabSystem />

          <VRPlayer />

          <CustomArcTeleport playerPosition={initialPlayerPosition} />

          <Physics gravity={[0, -9.81, 0]}>
            <CurrentLevelComponent />
          </Physics>
        </XR>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
