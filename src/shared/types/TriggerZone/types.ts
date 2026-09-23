import type { RapierRigidBody } from "@react-three/rapier";

export interface CustomRapierRigidBody extends RapierRigidBody {
  userData: {
    initialPosition: [number, number, number];
  };
}
