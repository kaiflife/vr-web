import { useEffect, type RefObject } from "react";
import type { Object3D } from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import { InteractableRegistry } from "@/shared/utils/InteractableRegistry";

interface UseGrabableProps {
  meshRef: RefObject<Object3D | null>;
  rbRef?: RefObject<RapierRigidBody | null>;
  maxDistance?: number;
  onGrab?: (hand: "left" | "right") => void;
  onRelease?: () => void;
}

export function useGrabable({
  meshRef,
  rbRef,
  maxDistance = 2,
  onGrab,
  onRelease,
}: UseGrabableProps) {
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    InteractableRegistry.add({
      mesh,
      rigidBody: rbRef?.current,
      maxDistance,
      onGrab: (hand) => {
        if (rbRef?.current) {
          // 🚀 Вместо кинематики отключаем гравитацию и будим объект
          rbRef.current.setGravityScale(0, true);
          rbRef.current.wakeUp();
          rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        onGrab?.(hand);
      },
      onRelease: () => {
        if (rbRef?.current) {
          // 🚀 Возвращаем гравитацию
          rbRef.current.setGravityScale(1, true);
          rbRef.current.wakeUp();
        }
        onRelease?.();
      },
    });

    return () => {
      InteractableRegistry.remove(mesh);
    };
  }, [meshRef, rbRef, maxDistance, onGrab, onRelease]);
}
