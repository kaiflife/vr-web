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
    // Даем рейкастеру крошечный запас по длине (1 миллиметр),
    // чтобы гарантированно пробивать стыки полигонов
    _raycaster.far = len + 0.001;

    // Ищем пересечения только среди заранее отфильтрованных телепортируемых полов
    const intersects = _raycaster.intersectObjects(targetObjects, true);

    // 🎯 ИСПРАВЛЕНИЕ: Так как в targetObjects лежат ТОЛЬКО валидные полы,
    // мы просто берем самое первое пересечение, полностью игнорируя проверку distance!
    const validIntersect = intersects[0];

    if (validIntersect) {
      hitPoint = validIntersect.point;
      arcPoints.push(hitPoint.clone());
      isValidTarget = true; // Любое попадание в пол из targetObjects теперь на 100% валидно
      break;
    }

    // Лимит максимальной длины дуги от игрока
    if (originPos.distanceTo(_nextPoint) > 2) break;

    _currentPoint.copy(_nextPoint);
    arcPoints.push(_currentPoint.clone());
  }

  return { arcPoints, hitPoint, isValidTarget };
}
