import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { XROrigin } from "@react-three/xr";
import * as THREE from "three";
import { useGameStore } from "@/entities";

const _lastPosition = new THREE.Vector3();

export function VRPlayer() {
  const originRef = useRef<THREE.Group>(null);

  // Синхронизируем начальную позицию при старте игры
  useEffect(() => {
    const startPos = useGameStore.getState().playerPosition;
    _lastPosition.copy(startPos);
    if (originRef.current) {
      originRef.current.position.copy(startPos);
    }
  }, []);

  useFrame(() => {
    const originGroup = originRef.current;
    if (!originGroup) return;

    // Читаем позицию напрямую из Zustand-стора в обход реактивности React
    const storePos = useGameStore.getState().playerPosition;

    // 🚀 Если координаты в сторе изменились (произошел телепорт)
    if (!_lastPosition.equals(storePos)) {
      _lastPosition.copy(storePos);

      // Мгновенно перемещаем точку отсчета XR-пространства (игрока и его камеру)
      originGroup.position.copy(storePos);
    }
  });

  return (
    // XROrigin под капотом создает THREE.Group.
    // Обернув его в нашу группу, мы получаем полный контроль над его координатами в useFrame.
    <group ref={originRef}>
      <XROrigin />
    </group>
  );
}
