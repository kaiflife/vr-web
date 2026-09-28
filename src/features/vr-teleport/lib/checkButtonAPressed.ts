export function checkButtonAPressed(gamepad: Gamepad | undefined): boolean {
  if (!gamepad || !gamepad.buttons) return false;

  const buttonA = gamepad.buttons[4];

  return buttonA ? buttonA.pressed || buttonA.value > 0.5 : false;
}
