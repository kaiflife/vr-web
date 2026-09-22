import React from "react";

export default function SceneLight(): React.JSX.Element {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
    </>
  );
}
