import { TriggerZone } from "@/feature/ui/TriggerZone/TriggerZone";
import type { CustomRapierRigidBody } from "@/shared";

interface IProps {
  triggerNames: Set<string>;
}

export const DeadZone = ({ triggerNames }: IProps) => {
  const triggerDeadZone = (
    cubes: string[],
    rigidBody?: CustomRapierRigidBody,
  ) => {
    const initialPosition = rigidBody?.userData?.initialPosition;

    if (!initialPosition) return;

    if (cubes.some((item) => triggerNames.has(item))) {
      rigidBody?.setTranslation(
        { x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] },
        true,
      );
    }
  };

  return (
    <TriggerZone
      visible={false}
      position={[-0.2, -2, -1.5]}
      size={[40, 0.1, 40]}
      color="red"
      onTrigger={triggerDeadZone}
      triggerNames={triggerNames}
      soundPath="/sounds/resetPosition.mp3"
    />
  );
};
