// Keyboard and mouse input. One job: turn raw events into a small state
// object the game loop reads, including click-to-use gadget buttons.

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    clicked: false,
    justPressed: new Set(),
    gadgetClick: null,
  };

  function keyName(event) {
    return event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }

  window.addEventListener('keydown', (event) => {
    const name = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!input.keys.has(name)) input.justPressed.add(name);
    input.keys.add(name);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(keyName(event));
  });
  window.addEventListener('blur', () => {
    input.keys.clear();
    input.mouseDown = false;
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    input.mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', (event) => {
    input.mouseDown = true;
    input.clicked = true;
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    input.mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  window.addEventListener('mouseup', () => { input.mouseDown = false; });

  return input;
}

export function inputMoveAxis(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('a') || input.keys.has('ArrowLeft')) x -= 1;
  if (input.keys.has('d') || input.keys.has('ArrowRight')) x += 1;
  if (input.keys.has('w') || input.keys.has('ArrowUp')) y -= 1;
  if (input.keys.has('s') || input.keys.has('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}

export function consumeJustPressed(input, name) {
  if (input.justPressed.has(name)) {
    input.justPressed.delete(name);
    return true;
  }
  return false;
}

export function endInputFrame(input) {
  input.justPressed.clear();
  input.clicked = false;
  input.gadgetClick = null;
}
