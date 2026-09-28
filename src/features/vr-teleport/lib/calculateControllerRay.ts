import { Matrix4, type Vector3 } from "three";

const _matrix = new Matrix4();

export function calculateControllerRay(
  fiberState: any,
  targetRaySpace: any,
  playerPosition: any, // Может быть массивом [number, number, number] или Vector3
  outWorldPos: Vector3,
  outWorldDir: Vector3,
): boolean {
  const xrFrame = fiberState.gl.xr.getFrame() as any;
  const xrReferenceSpace = fiberState.gl.xr.getReferenceSpace() as any;

  if (!xrFrame || !xrReferenceSpace || !targetRaySpace) return false;

  const pose = xrFrame.getPose(targetRaySpace, xrReferenceSpace);
  if (!pose || !pose.transform) return false;

  // 1. Извлекаем локальные данные из WebXR матрицы
  _matrix.fromArray(pose.transform.matrix);
  outWorldPos.setFromMatrixPosition(_matrix);
  outWorldDir
    .set(0, 0, -1)
    .applyMatrix4(new Matrix4().extractRotation(_matrix));

  // 2. Складываем с playerPosition (обрабатываем и Vector3, и обычный массив [x,y,z])
  if (playerPosition && (playerPosition as Vector3).isVector3) {
    outWorldPos.add(playerPosition as Vector3);
  } else if (Array.isArray(playerPosition)) {
    outWorldPos.x += playerPosition[0];
    outWorldPos.y += playerPosition[1];
    outWorldPos.z += playerPosition[2];
  }

  return true;
}
