// Словарь со всеми звуками игры и путями к ним в папке public
export const SOUNDS = {
  levelChange: "/sounds/changeLevel.mp3",
  activateTriggerZone: "/sounds/activateTriggerZone.mp3",
  resetPosition: "/sounds/resetPosition.mp3",
  cubeDrop2: "/sounds/cubeDrop2.mp3",
  grab: "/sounds/grab.mp3",
  teleport: "/sounds/teleport.mp3",
} as const;

type SoundKey = keyof typeof SOUNDS;

// Кэш для хранения уже созданных объектов Audio
const audioCache: Record<string, HTMLAudioElement> = {};

export const soundManager = {
  /**
   * Проиграть звук по его ключу
   */
  play(key: SoundKey, volume = 1.0) {
    if (typeof Audio === "undefined") return;

    const path = SOUNDS[key];

    // Если звука нет в кэше — создаем его
    if (!audioCache[path]) {
      audioCache[path] = new Audio(path);
    }

    const audio = audioCache[path];

    audio.volume = volume;
    audio.currentTime = 0; // Сброс в начало, если звук уже играет

    audio.play().catch((err) => {
      // Ловим блокировку звука браузером до первого клика
      console.debug(
        `[SoundManager] Воспроизведение "${key}" отложено до взаимодействия:`,
        err.message,
      );
    });
  },

  /**
   * Предзагрузка всех звуков (полезно вызвать на стартовом экране)
   */
  preloadAll() {
    if (typeof Audio === "undefined") return;

    Object.values(SOUNDS).forEach((path) => {
      if (!audioCache[path]) {
        const audio = new Audio(path);
        audio.preload = "auto";
        audioCache[path] = audio;
      }
    });
  },
};
