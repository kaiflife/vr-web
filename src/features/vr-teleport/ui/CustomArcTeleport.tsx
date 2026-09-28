import { useXRInputSourceState } from "@react-three/xr";
import { useRef, useState } from "react";
import { Object3D, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { checkButtonAPressed } from "../lib/checkButtonAPressed";
import { calculateControllerRay } from "../lib/calculateControllerRay";
import { filterSceneObjects } from "../lib/filterSceneObjects";
import { calculateTeleportArc } from "../lib/calculateTeleportArc";
import { useGameStore } from "@/entities";

interface CustomArcTeleportProps {
  playerPosition: Vector3;
}

const _worldPos = new Vector3();
const _worldDir = new Vector3();

export function CustomArcTeleport({ playerPosition }: CustomArcTeleportProps) {
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const teleportableObjectsRef = useRef<Object3D[]>([]);

  const state = useXRInputSourceState("controller", "right");
  const wasPressedRef = useRef(false);

  const [points, setPoints] = useState<Vector3[]>([]);
  const [hitPoint, setHitPoint] = useState<Vector3 | null>(null);
  const [isValidTarget, setIsValidTarget] = useState(false);

  useFrame((fiberState) => {
    const gamepad = state?.inputSource?.gamepad;
    const isPressed = checkButtonAPressed(gamepad);

    if (!isPressed || !state?.inputSource?.targetRaySpace) {
      // 🎯 момент телепорта: Вызываем колбэк, переданный сверху
      if (wasPressedRef.current && hitPoint && isValidTarget) {
        setPlayerPosition(hitPoint.clone());
      }
      if (points.length > 0) setPoints([]);
      if (hitPoint) setHitPoint(null);

      setIsValidTarget(false);
      wasPressedRef.current = false;

      teleportableObjectsRef.current = [];
      return;
    }

    if (teleportableObjectsRef.current.length === 0) {
      teleportableObjectsRef.current = filterSceneObjects(fiberState.scene);
    }

    wasPressedRef.current = true;

    const success = calculateControllerRay(
      fiberState,
      state.inputSource.targetRaySpace,
      playerPosition,
      _worldPos,
      _worldDir,
    );
    if (!success) return;

    const result = calculateTeleportArc(
      _worldPos,
      _worldDir,
      teleportableObjectsRef.current,
    );

    setPoints(result.arcPoints);
    setHitPoint(result.hitPoint);
    setIsValidTarget(result.isValidTarget);
  });

  if (points.length === 0) return null;

  return (
    <group name="teleport-system-visuals">
      <Line
        points={points}
        color={isValidTarget ? "#00ff00" : "#ff0000"}
        lineWidth={4}
      />
      {hitPoint && (
        <mesh position={hitPoint} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.22, 32]} />
          <meshBasicMaterial
            color={isValidTarget ? "#00ff00" : "#ff0000"}
            side={2}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}
