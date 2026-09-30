import { useXRInputSourceState } from "@react-three/xr";
import { useRef } from "react";
import { Vector3, Mesh, Group, MeshBasicMaterial, Color } from "three";
import { useFrame, extend } from "@react-three/fiber";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { checkButtonAPressed } from "../lib/checkButtonAPressed";
import { calculateControllerRay } from "../lib/calculateControllerRay";
import { calculateTeleportArc } from "../lib/calculateTeleportArc";
import { useGameStore } from "@/entities";
import { TeleportRegistry } from "@/shared";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      line2: any;
      lineGeometry: any;
      lineMaterial: any;
    }
  }
}

// Регистрируем тяжелые нативные элементы Three.js в системе Fiber, чтобы использовать их как JSX tags
extend({ Line2, LineGeometry, LineMaterial });

interface CustomArcTeleportProps {
  playerPosition: Vector3;
}

const _worldPos = new Vector3();
const _worldDir = new Vector3();
const _finalHitPoint = new Vector3();

const COLOR_VALID = new Color("#00ff00");
const COLOR_INVALID = new Color("#ff0000");

export function CustomArcTeleport({ playerPosition }: CustomArcTeleportProps) {
  const state = useXRInputSourceState("controller", "right");
  const wasPressedRef = useRef(false);

  const visualGroupRef = useRef<Group>(null);
  const lineRef = useRef<any>(null); // Реф на нашу кастомную линию <line2>
  const ringRef = useRef<Mesh>(null);

  const pointsBufferRef = useRef<Vector3[]>(
    Array.from({ length: 40 }, () => new Vector3()),
  );

  // Выделяем плоский массив памяти под 40 точек (120 координат)
  const positionsFloatArrayRef = useRef(new Float32Array(120));

  useFrame((fiberState) => {
    const gamepad = state?.inputSource?.gamepad;
    const isPressed = checkButtonAPressed(gamepad);

    const visualGroup = visualGroupRef.current;
    const line = lineRef.current;
    const ring = ringRef.current;

    if (!isPressed || !state?.inputSource?.targetRaySpace) {
      if (wasPressedRef.current && visualGroup?.visible && ring?.visible) {
        const setPlayerPosition = useGameStore.getState().setPlayerPosition;
        setPlayerPosition(_finalHitPoint);
      }

      if (visualGroup && visualGroup.visible) {
        visualGroup.visible = false;
      }

      wasPressedRef.current = false;
      return;
    }

    wasPressedRef.current = true;

    const success = calculateControllerRay(
      fiberState,
      state.inputSource.targetRaySpace,
      playerPosition,
      _worldPos,
      _worldDir,
    );

    if (!success) {
      if (visualGroup) visualGroup.visible = false;
      return;
    }

    const teleportableObjects = TeleportRegistry.getObjects();

    const { count, isValidTarget } = calculateTeleportArc(
      _worldPos,
      _worldDir,
      teleportableObjects,
      pointsBufferRef.current,
      _finalHitPoint,
    );

    if (visualGroup) {
      visualGroup.visible = true;

      if (line && line.geometry) {
        const floatArray = positionsFloatArrayRef.current;
        const points = pointsBufferRef.current;

        // Заполняем плоский массив новыми координатами
        for (let i = 0; i < count; i++) {
          const index = i * 3;
          floatArray[index] = points[i].x;
          floatArray[index + 1] = points[i].y;
          floatArray[index + 2] = points[i].z;
        }

        // 🚀 НАДЕЖНЫЙ МЕТОД ОБНОВЛЕНИЯ ВЕРШИН В THREE.JS:
        // Передаем только ту часть массива, которая заполнена (count * 3)
        // Использование подмассива .subarray() делает срез мгновенно и без выделения новой памяти
        line.geometry.setPositions(floatArray.subarray(0, count * 3));

        // 🚀 КЛЮЧЕВОЙ ФИКС: Принудительно заставляем Three.js пересчитать размеры и индексы шейдера линии
        line.geometry.computeBoundingSphere();
        line.geometry.computeBoundingBox();

        // Обновляем цвет линии
        if (line.material) {
          line.material.color.copy(isValidTarget ? COLOR_VALID : COLOR_INVALID);
        }
      }

      if (ring) {
        if (isValidTarget) {
          ring.visible = true;
          ring.position.copy(_finalHitPoint);
          const ringMaterial = ring.material as MeshBasicMaterial;
          if (ringMaterial) ringMaterial.color.copy(COLOR_VALID);
        } else {
          ring.visible = false;
        }
      }
    }
  });

  // Настраиваем адаптивное разрешение толщины линии под размер экрана шлема
  useFrame((fiberState) => {
    if (lineRef.current?.material) {
      lineRef.current.material.resolution.set(
        fiberState.size.width,
        fiberState.size.height,
      );
    }
  });

  return (
    <group ref={visualGroupRef} name="teleport-system-visuals" visible={false}>
      {/* 🚀 ИСПОЛЬЗУЕМ НАШУ ДОЛГОВЕЧНУЮ ЛИНИЮ */}
      {/* @ts-ignore */}
      <line2 ref={lineRef} frustumCulled={false}>
        {/* @ts-ignore */}
        <lineGeometry />
        {/* @ts-ignore */}
        <lineMaterial linewidth={4} transparent depthTest={true} />
      </line2>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.22, 32]} />
        <meshBasicMaterial
          side={2}
          depthTest={true}
          polygonOffset={true}
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>
    </group>
  );
}
