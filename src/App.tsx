import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, XROrigin, noEvents, PointerEvents } from "@react-three/xr";

import "./App.css";
import { Physics } from "@react-three/rapier";
import { DEFAULT_CAMERA } from "./constants";
import { useGameStore } from "@/entities";
import { LEVEL_COMPONENTS } from "@/app/config/levels";
import { xrStore } from "@/app/model/xtStore";
import { SceneLight } from "@/feature";

export default function App(): React.JSX.Element {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const currentLevel = useGameStore((state) => state.currentLevel);

  const CurrentLevelComponent = LEVEL_COMPONENTS[currentLevel];

  return (
    <div className="app-container">
      <Canvas camera={DEFAULT_CAMERA} events={noEvents}>
        <SceneLight />

        <XR store={xrStore}>
          <XROrigin position={playerPosition} />
          <PointerEvents />

          <Physics gravity={[0, -9.81, 0]}>
            <CurrentLevelComponent />
          </Physics>
        </XR>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
