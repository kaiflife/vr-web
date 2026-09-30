/**
 * Проверяет, зажата ли кнопка А на контроллере.
 * Добавлена валидация длины массива кнопок во избежание Out of Bounds ошибок.
 */
export function checkButtonAPressed(gamepad: Gamepad | undefined): boolean {
  if (!gamepad || !gamepad.buttons || gamepad.buttons.length <= 4) return false;

  const buttonA = gamepad.buttons[4];
  return buttonA ? buttonA.pressed || buttonA.value > 0.5 : false;
}
