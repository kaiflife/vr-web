import { Raycaster, Vector3, type Object3D } from "three";

interface ArcResult {
  count: number;
  isValidTarget: boolean;
}

const _velocity = new Vector3();
const _currentPoint = new Vector3();
const _segmentVector = new Vector3();
const _gravity = new Vector3(0, -9.81, 0);
const _nextPoint = new Vector3();
const _raycaster = new Raycaster();

// 💡 СОВЕТ: Увеличьте MAX_DISTANCE, если 2 метра — это слишком мало для вашей сцены
const MAX_DISTANCE = 2;

export function calculateTeleportArc(
  originPos: Vector3,
  direction: Vector3,
  targetObjects: Object3D[],
  pointsBuffer: Vector3[],
  outHitPoint: Vector3,
): ArcResult {
  let isValidTarget = false;
  let count = 0;

  // Инициализируем первую точку в буфере вершины дуги
  pointsBuffer[count].copy(originPos);
  count++;

  // Задаем скорость вылета дуги из контроллера
  _velocity.copy(direction).multiplyScalar(10);
  _currentPoint.copy(originPos);

  for (let i = 0; i < 40; i++) {
    // Рассчитываем физику падения дуги под гравитацией
    _velocity.addScaledVector(_gravity, 0.025);
    _nextPoint.copy(_currentPoint).addScaledVector(_velocity, 0.025);

    // Лимит максимальной длины дуги от игрока
    if (originPos.distanceTo(_nextPoint) > MAX_DISTANCE) break;

    _segmentVector.subVectors(_nextPoint, _currentPoint);
    const len = _segmentVector.length();

    _raycaster.set(_currentPoint, _segmentVector.normalize());
    _raycaster.far = len + 0.001;

    // 🚀 Ищем пересечения с полами
    const intersects = _raycaster.intersectObjects(targetObjects, true);

    // 🎯 ИСПРАВЛЕНИЕ: Проверяем, что рейкастер РЕАЛЬНО что-то нашел
    if (intersects.length > 0) {
      const firstHit = intersects[0]; // Берем самое ближайшее пересечение

      outHitPoint.copy(firstHit.point); // Записываем точку пересечения
      pointsBuffer[count].copy(outHitPoint); // Добавляем ее финальной в буфер дуги
      count++;

      isValidTarget = true; // Цель валидна — луч станет ЗЕЛЕНЫМ
      break; // Прерываем цикл, дуга встретила пол и дальше не летит
    }

    // Если препятствий нет, двигаем точку дуги дальше
    _currentPoint.copy(_nextPoint);
    pointsBuffer[count].copy(_currentPoint);
    count++;
  }

  return { count, isValidTarget };
}
