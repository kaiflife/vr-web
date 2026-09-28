import type { Object3D } from "three";

/**
 * 4. Находит в сцене ТОЛЬКО те объекты (меши), которые разрешены для телепортации.
 * Полностью исключает коллизии со сторонними объектами, руками и линиями.
 */
export function filterSceneObjects(scene: Object3D): Object3D[] {
  const teleportableObjects: Object3D[] = [];

  // Рекурсивно обходим дерево сцены Three.js
  scene.traverse((obj) => {
    // Проверяем, является ли объект мешем (чистой геометрией)
    // и есть ли у него (или у его группы-родителя) флаг isTeleportable
    if (
      (obj as any).isMesh &&
      (obj.userData?.isTeleportable === true ||
        obj.parent?.userData?.isTeleportable === true)
    ) {
      teleportableObjects.push(obj);
    }
  });

  return teleportableObjects;
}
