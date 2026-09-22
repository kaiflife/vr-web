import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { Physics } from "@react-three/rapier"; // Импортируем физический мир

import SceneLight from "./components/SceneLight";
import Floor from "./components/Floor";
import Table from "./components/Table";
import { DraggableCubeWithRotation } from "./components/DraggableCubeWithRotation";

const store = createXRStore();

export default function App(): React.JSX.Element {
  const [playerOffset, setPlayerOffset] = useState<
    [number, number, number] | undefined
  >(undefined);

  const handleTeleport = (targetPosition: [number, number, number]): void => {
    setPlayerOffset(targetPosition);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#222" }}>
      <button
        onClick={() => store.enterVR()}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "12px 24px",
          background: "#FF5722",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ENTER VR
      </button>

      <Canvas camera={{ position: [0, 1.6, 3], fov: 60 }}>
        <SceneLight />

        <XR store={store}>
          <Physics gravity={[0, -9.81, 0]}>
            <Floor onTeleport={handleTeleport} />
            <Table />
            <DraggableCubeWithRotation />
          </Physics>

          <group position={playerOffset} />
        </XR>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
