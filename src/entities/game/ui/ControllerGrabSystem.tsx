import React, { useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { InteractableRegistry, type InteractableObject } from "@/shared";
import { useGameStore } from "@/entities";

extend({ Line2, LineGeometry, LineMaterial });

// Вспомогательные структуры в памяти модуля (GC Safe)
const _raycaster = new THREE.Raycaster();
const _controllerPos = new THREE.Vector3();
const _controllerDir = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _rotationMatrix = new THREE.Matrix4();

// Кэшированные математические объекты для расчетов кадров
const _tmpQuaternion = new THREE.Quaternion();
const _tmpQuaternion2 = new THREE.Quaternion();
const _tmpQuaternion3 = new THREE.Quaternion();
const _currentCubePosition = new THREE.Vector3();
const _targetWorldPos = new THREE.Vector3();
const _velocityVector = new THREE.Vector3();
const _angularVelocityVector = new THREE.Vector3();

const _currentCubeQuaternion = new THREE.Quaternion();

const COLOR_LASER_FREE = new THREE.Color("#ffffff");
const COLOR_LASER_HIT = new THREE.Color("#00ff00");

interface HandState {
  holdingObject: InteractableObject | null;
  wasTriggerPressed: boolean;
  rotationOffset: THREE.Quaternion;
  localPositionOffset: THREE.Vector3;
  lineRef: any;
  floatArray: Float32Array;
  laserEnd: THREE.Vector3;
  validHitConfig: InteractableObject | null;
  // Сохраняем скорости для честного физического броска
  lastLinearVelocity: THREE.Vector3;
  lastAngularVelocity: THREE.Vector3;
}

function createHandState(): HandState {
  return {
    holdingObject: null,
    wasTriggerPressed: false,
    rotationOffset: new THREE.Quaternion(),
    localPositionOffset: new THREE.Vector3(),
    lineRef: null,
    floatArray: new Float32Array(6),
    laserEnd: new THREE.Vector3(),
    validHitConfig: null,
    lastLinearVelocity: new THREE.Vector3(),
    lastAngularVelocity: new THREE.Vector3(),
  };
}

export function ControllerGrabSystem(): React.JSX.Element | null {
  const leftXRState = useXRInputSourceState("controller", "left");
  const rightXRState = useXRInputSourceState("controller", "right");

  const leftHand = useRef<HandState>(createHandState());
  const rightHand = useRef<HandState>(createHandState());

  useFrame((fiberState) => {
    processHand("left", leftXRState, leftHand.current, fiberState);
    processHand("right", rightXRState, rightHand.current, fiberState);
  });

  function processHand(
    handedness: "left" | "right",
    xrState: any,
    hand: HandState,
    fiberState: any,
  ) {
    const gamepad = xrState?.inputSource?.gamepad;
    const targetRaySpace = xrState?.inputSource?.targetRaySpace;
    const xrObject = xrState?.object;
    const line = hand.lineRef;

    if (!targetRaySpace || !xrObject || !gamepad || !gamepad.buttons) {
      if (hand.holdingObject) releaseObject(hand);
      if (line) line.visible = false;
      return;
    }

    const triggerBtn = gamepad.buttons;
    const isTriggerPressed = triggerBtn
      ? triggerBtn[0].pressed || triggerBtn[0].value > 0.15
      : false;

    const xrFrame = fiberState.gl.xr.getFrame() as any;
    const xrReferenceSpace = fiberState.gl.xr.getReferenceSpace() as any;
    if (!xrFrame || !xrReferenceSpace) return;

    const pose = xrFrame.getPose(targetRaySpace, xrReferenceSpace);
    if (!pose || !pose.transform) return;

    const playerPos = useGameStore.getState().playerPosition;

    _matrix.fromArray(pose.transform.matrix);
    _controllerPos.setFromMatrixPosition(_matrix).add(playerPos);

    _rotationMatrix.extractRotation(_matrix);
    _tmpQuaternion.setFromRotationMatrix(_rotationMatrix);
    _controllerDir.set(0, 0, -1).applyMatrix4(_rotationMatrix).normalize();

    if (line?.material) {
      line.material.resolution.set(
        fiberState.size.width,
        fiberState.size.height,
      );
    }

    // --- ЛОГИКА 1: ОБЪЕКТ УЖЕ В РУКЕ ---
    if (hand.holdingObject) {
      if (line) line.visible = false;

      if (!isTriggerPressed && hand.wasTriggerPressed) {
        releaseObject(hand);
        hand.wasTriggerPressed = false;
        return;
      }

      const rb = hand.holdingObject.rigidBody;
      if (rb) {
        // 🚀 ФИКС 1: Удалили rb.wakeUp() отсюда! Rapier сам активирует тело при смене скоростей.
        // Это полностью убирает ошибку "recursive use of an object / unsafe aliasing in rust".

        const localControllerPos = new THREE.Vector3().setFromMatrixPosition(
          _matrix,
        );

        // 1. Находим целевую точку удержания предмета в мировом пространстве
        _targetWorldPos
          .copy(hand.localPositionOffset)
          .applyQuaternion(_tmpQuaternion)
          .add(localControllerPos)
          .add(playerPos);

        // 2. Получаем текущую физическую позицию куба
        const rbPos = rb.translation();
        _currentCubePosition.set(rbPos.x, rbPos.y, rbPos.z);

        // Расчет линейной скорости притяжения к руке
        _velocityVector
          .subVectors(_targetWorldPos, _currentCubePosition)
          .multiplyScalar(35);
        rb.setLinvel(_velocityVector, true);
        hand.lastLinearVelocity.copy(_velocityVector);

        // 3. Расчет угловой скорости вращения предмета вслед за кистью
        // 3. Расчет угловой скорости вращения предмета вслед за кистью
        const rbRot = rb.rotation();
        _tmpQuaternion2.set(rbRot.x, rbRot.y, rbRot.z, rbRot.w);

        // Вычисляем целевое мировое вращение, которое должен иметь куб в этот кадр
        const targetRotation = _tmpQuaternion3
          .copy(_tmpQuaternion)
          .multiply(hand.rotationOffset);

        // 🚀 ФИКС: Безопасно находим дельту вращения через промежуточный кватернион
        _tmpQuaternion2.invert().multiply(targetRotation);

        // Переводим разницу углов в угловую скорость для Rapier
        const angle =
          2 * Math.acos(Math.min(Math.max(_tmpQuaternion2.w, -1), 1));

        const dt = fiberState.delta;
        if (angle > 0.001 && dt > 0) {
          // Множитель 25 отвечает за отзывчивость вращения (можете прибавить, если куб вращается вяло)
          const speedFactor = (angle * 25) / dt;

          if (Number.isFinite(speedFactor)) {
            _angularVelocityVector
              .set(_tmpQuaternion2.x, _tmpQuaternion2.y, _tmpQuaternion2.z)
              .normalize();
            _angularVelocityVector.multiplyScalar(speedFactor);

            rb.setAngvel(_angularVelocityVector, true);
            hand.lastAngularVelocity.copy(_angularVelocityVector); // Кэшируем для кручения при броске
          }
        } else {
          rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      }

      hand.wasTriggerPressed = isTriggerPressed;
      return;
    }

    // --- ЛОГИКА 2: ПОИСК ОБЪЕКТА ЛУЧОМ (СВОБОДНАЯ РУКА) ---
    const interactableMeshes = InteractableRegistry.getObjectsForRaycast();

    if (interactableMeshes.length === 0) {
      hand.validHitConfig = null;
      hand.laserEnd.copy(_controllerPos).addScaledVector(_controllerDir, 2.0);
      updateLaserVisual(hand, _controllerPos, hand.laserEnd, false);
      hand.wasTriggerPressed = isTriggerPressed;
      return;
    }

    _raycaster.set(_controllerPos, _controllerDir);
    _raycaster.far = 10;
    const intersects = _raycaster.intersectObjects(interactableMeshes, true);
    const hit = intersects[0];

    let isTargetValid = false;
    hand.validHitConfig = null;

    if (hit) {
      let currentObj: THREE.Object3D | null = hit.object;
      let config: InteractableObject | undefined;

      while (currentObj) {
        config = InteractableRegistry.getConfig(currentObj);
        if (config) break;
        currentObj = currentObj.parent;
      }

      if (config) {
        const allowedDistance = config.maxDistance ?? 2.0;

        if (hit.distance <= allowedDistance) {
          isTargetValid = true;
          hand.validHitConfig = config;
          hand.laserEnd.copy(hit.point);

          if (isTriggerPressed && !hand.wasTriggerPressed) {
            const localControllerPos =
              new THREE.Vector3().setFromMatrixPosition(_matrix);
            grabObject(
              hand,
              config,
              localControllerPos,
              _tmpQuaternion,
              playerPos,
              handedness,
            );
          }
        }
      }
    }

    if (!isTargetValid) {
      hand.laserEnd.copy(_controllerPos).addScaledVector(_controllerDir, 2.0);
    }

    updateLaserVisual(hand, _controllerPos, hand.laserEnd, isTargetValid);
    hand.wasTriggerPressed = isTriggerPressed;
  }

  return (
    <group name="grab-system-visual-lasers">
      <line2
        ref={(el) => {
          leftHand.current.lineRef = el;
        }}
        frustumCulled={false}
      >
        <lineGeometry />
        <lineMaterial linewidth={2.5} transparent depthTest={true} />
      </line2>
      <line2
        ref={(el) => {
          rightHand.current.lineRef = el;
        }}
        frustumCulled={false}
      >
        <lineGeometry />
        <lineMaterial linewidth={2.5} transparent depthTest={true} />
      </line2>
    </group>
  );
}

function updateLaserVisual(
  hand: HandState,
  start: THREE.Vector3,
  end: THREE.Vector3,
  isHit: boolean,
) {
  const line = hand.lineRef;
  if (!line || !line.geometry) return;

  line.visible = true;
  const arr = hand.floatArray;

  arr[0] = start.x;
  arr[1] = start.y;
  arr[2] = start.z;
  arr[3] = end.x;
  arr[4] = end.y;
  arr[5] = end.z;

  line.geometry.setPositions(arr);
  line.geometry.computeBoundingSphere();

  if (line.material) {
    line.material.color.copy(isHit ? COLOR_LASER_HIT : COLOR_LASER_FREE);
    line.material.opacity = isHit ? 0.9 : 0.25;
  }
}

function grabObject(
  hand: HandState,
  config: InteractableObject,
  localControllerPos: THREE.Vector3,
  controllerRot: THREE.Quaternion,
  playerPos: THREE.Vector3,
  handedness: "left" | "right",
) {
  hand.holdingObject = config;
  config.onGrab?.(handedness);

  const rb = config.rigidBody;
  if (rb) {
    const rbPos = rb.translation();
    const rbRot = rb.rotation();

    _currentCubePosition.set(rbPos.x, rbPos.y, rbPos.z).sub(playerPos);
    _currentCubeQuaternion.set(rbRot.x, rbRot.y, rbRot.z, rbRot.w);

    hand.rotationOffset
      .copy(controllerRot)
      .invert()
      .multiply(_currentCubeQuaternion);
    _tmpQuaternion.copy(controllerRot).invert();
    hand.localPositionOffset
      .copy(_currentCubePosition)
      .sub(localControllerPos)
      .applyQuaternion(_tmpQuaternion);
  }
  config.rigidBody?.wakeUp();
}

function releaseObject(hand: HandState) {
  if (hand.holdingObject) {
    const rb = hand.holdingObject.rigidBody;
    if (rb) {
      // 🚀 ФИЗИЧЕСКИЙ БРОСОК: Передаем накопленную скорость взмаха руки свободному кубу!
      _velocityVector.copy(hand.lastLinearVelocity).clampLength(0, 17);
      rb.setLinvel(_velocityVector, true);

      _angularVelocityVector.copy(hand.lastAngularVelocity).clampLength(0, 12);
      rb.setAngvel(_angularVelocityVector, true);
    }

    hand.holdingObject.onRelease?.();
    hand.holdingObject = null;
  }
}
