import type { Object3D } from "three";
import type { RapierRigidBody } from "@react-three/rapier";

export interface InteractableObject {
  mesh: Object3D;
  rigidBody?: RapierRigidBody | null;
  maxDistance?: number; // 🚀 Кастомная длина луча индивидуально для каждого предмета!
  onGrab?: (hand: "left" | "right") => void;
  onRelease?: () => void;
}

class InteractableRegistryService {
  private registry = new Map<Object3D, InteractableObject>();
  private targetMeshes: Object3D[] = [];

  add(config: InteractableObject) {
    this.registry.set(config.mesh, config);
    if (!this.targetMeshes.includes(config.mesh)) {
      this.targetMeshes.push(config.mesh);
    }
  }

  remove(mesh: Object3D | null | undefined) {
    if (!mesh) return;
    this.registry.delete(mesh);
    const index = this.targetMeshes.indexOf(mesh);
    if (index !== -1) {
      this.targetMeshes.splice(index, 1);
    }
  }

  // Массив мешей исключительно для передачи в raycaster.intersectObjects()
  getObjectsForRaycast(): Object3D[] {
    return this.targetMeshes;
  }

  getConfig(mesh: Object3D): InteractableObject | undefined {
    return this.registry.get(mesh);
  }
}

export const InteractableRegistry = new InteractableRegistryService();
