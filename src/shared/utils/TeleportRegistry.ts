import type { Object3D } from "three";

class TeleportRegistryService {
  // Список всех объектов сцены, на которые можно телепортироваться
  private objects: Object3D[] = [];

  /**
   * Добавляет объект в реестр, если его там еще нет
   */
  add(object: Object3D | null | undefined) {
    if (!object) return;
    if (!this.objects.includes(object)) {
      this.objects.push(object);
    }
  }

  /**
   * Удаляет объект из реестра (например, при размонтировании уровня)
   */
  remove(object: Object3D | null | undefined) {
    if (!object) return;
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }

  /**
   * Возвращает актуальный массив объектов для рейкастера
   */
  getObjects(): Object3D[] {
    return this.objects;
  }

  /**
   * Полная очистка реестра (пригодится при жесткой смене локаций)
   */
  clear() {
    this.objects = [];
  }
}

export const TeleportRegistry = new TeleportRegistryService();
