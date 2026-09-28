import { Raycaster, Vector3, type Object3D } from "three";

interface ArcResult {
  arcPoints: Vector3[];
  hitPoint: Vector3 | null;
  isValidTarget: boolean;
}

const _velocity = new Vector3();
const _currentPoint = new Vector3();
const _segmentVector = new Vector3();
const _gravity = new Vector3(0, -9.81, 0);
const _nextPoint = new Vector3();
const _raycaster = new Raycaster();

export function calculateTeleportArc(
  originPos: Vector3,
  direction: Vector3,
  targetObjects: Object3D[],
): ArcResult {
  const arcPoints: Vector3[] = [originPos.clone()];
  let hitPoint: Vector3 | null = null;
  let isValidTarget = false;

  _velocity.copy(direction).multiplyScalar(12); // Скорость вылета дуги
  _currentPoint.copy(originPos);

  for (let i = 0; i < 40; i++) {
    _velocity.addScaledVector(_gravity, 0.025);
    _nextPoint.copy(_currentPoint).addScaledVector(_velocity, 0.025);

    _segmentVector.subVectors(_nextPoint, _currentPoint);
    const len = _segmentVector.length();

    _raycaster.set(_currentPoint, _segmentVector.normalize());
    _raycaster.far = len;

    const intersects = _raycaster.intersectObjects(targetObjects, true);

    // Фильтруем пересечения: игнорируем коллизии ближе 15 см к руке и новые линии Drei
    const validIntersect = intersects.find((int) => {
      const type = int.object?.type;
      const isTooClose = int.distance <= 0.15;

      const isLine =
        type === "Line2" ||
        type === "LineSegments2" ||
        (int.object as any).isLine2;

      return !isTooClose && !isLine;
    });

    if (validIntersect) {
      hitPoint = validIntersect.point;
      arcPoints.push(hitPoint.clone());

      if (validIntersect.object.userData?.isTeleportable === true) {
        isValidTarget = true;
      }

      break; // Дуга столкнулась, завершаем параболу
    }

    // Лимит максимальной длины
    if (originPos.distanceTo(_nextPoint) > 2) break;

    _currentPoint.copy(_nextPoint);
    arcPoints.push(_currentPoint.clone());
  }

  return { arcPoints, hitPoint, isValidTarget };
}
