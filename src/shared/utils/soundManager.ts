import * as THREE from "three";

export const SOUNDS = {
  levelChange: "/sounds/changeLevel.mp3",
  activateTriggerZone: "/sounds/activateTriggerZone.mp3",
  resetPosition: "/sounds/resetPosition.mp3",
  cubeDrop2: "/sounds/cubeDrop2.mp3",
  grab: "/sounds/grab.mp3",
  teleport: "/sounds/teleport.mp3",
} as const;

type SoundKey = keyof typeof SOUNDS;

// Внутренние системные объекты Three.js для работы со звуком в VR
let listener: THREE.AudioListener | null = null;
const audioLoader = new THREE.AudioLoader();
const soundCache: Record<string, THREE.Audio> = {};
const bufferCache: Record<string, AudioBuffer> = {};

export const soundManager = {
  /**
   * Инициализация аудио-контекста Three.js.
   * Должна вызваться один раз при старте Canvas или при первом клике.
   */
  init(camera: THREE.Camera) {
    if (typeof window === "undefined" || listener) return;

    // Создаем слушатель и добавляем его к камере (важно для VR и пространственного звука)
    listener = new THREE.AudioListener();
    camera.add(listener);

    // Сразу запускаем предзагрузку в правильный буфер контекста
    this.preloadAll();

    this.resume();
  },

  async resume() {
    if (!listener || !listener.context) return;

    // Если контекст приостановлен браузером, принудительно запускаем его
    if (listener.context.state === "suspended") {
      try {
        await listener.context.resume();
        console.log(
          "🔊 [SoundManager] AudioContext успешно разблокирован жестом!",
        );
      } catch (err) {
        console.error(
          "❌ [SoundManager] Не удалось разблокировать AudioContext:",
          err,
        );
      }
    }
  },

  /**
   * Проиграть звук через WebAudio API (работает в Meta Quest 3 без блокировок)
   */
  play(key: SoundKey, volume = 1.0) {
    if (typeof window === "undefined") return;

    const path = SOUNDS[key];

    // Если слушатель еще не создан (например, игра стартовала сразу в VR),
    // создаем временный базовый слушатель, чтобы звук не терялся
    if (!listener) {
      listener = new THREE.AudioListener();
    }

    // Если звук для этого пути уже был настроен
    if (soundCache[path]) {
      const sound = soundCache[path];
      if (sound.isPlaying) sound.stop(); // Прерываем, если уже играет, чтобы пустить заново
      sound.setVolume(volume);
      sound.play();
      return;
    }

    // Создаем новый объект звука Three.js
    const sound = new THREE.Audio(listener);
    soundCache[path] = sound;

    // Если аудиофайл уже загружен в кэш буферов — запускаем мгновенно
    if (bufferCache[path]) {
      sound.setBuffer(bufferCache[path]);
      sound.setVolume(volume);
      sound.play();
      return;
    }

    // Если файла нет в буфере — лениво загружаем его (первый раз)
    audioLoader.load(
      path,
      (buffer) => {
        bufferCache[path] = buffer;
        sound.setBuffer(buffer);
        sound.setVolume(volume);
        sound.play();
      },
      undefined,
      (err) => {
        console.error(`[SoundManager] Ошибка загрузки звука ${key}:`, err);
      },
    );
  },

  /**
   * Правильная предзагрузка аудиофайлов в бинарные буферы памяти
   */
  preloadAll() {
    if (typeof window === "undefined") return;

    Object.values(SOUNDS).forEach((path) => {
      if (!bufferCache[path]) {
        audioLoader.load(
          path,
          (buffer) => {
            bufferCache[path] = buffer;
          },
          undefined,
          (err) => {
            console.debug(`[SoundManager] Ошибка предзагрузки: ${path}`, err);
          },
        );
      }
    });
  },
};
