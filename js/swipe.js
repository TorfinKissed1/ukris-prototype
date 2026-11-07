// Закрытие листов свайпом вниз за ручку или заголовок: лист снизу (dialog.sheet--bottom) и лист
// выпадашки на телефоне (.picker__panel). Лист едет за пальцем; отпустили дальше четверти высоты
// листа или резко смахнули вниз, лист закрывается, иначе возвращается на место.
// Без скрипта выпадашка закрывается повторным нажатием на её кнопку, нижний лист выбором пункта.

const HANDLE_SELECTOR = '.sheet--bottom .sheet__grabber, .sheet--bottom .sheet__head, .picker__head';
const CLOSE_SHARE = 0.25;
const FLICK_MIN_SHIFT = 20;
const FLICK_SPEED = 0.5; // пикселей в миллисекунду

let drag = null;

function closePanel(panel) {
  if (panel.matches('.picker__panel')) {
    // closePicker из js/picker.js уводит лист вниз и закрывает выпадашку.
    closePicker(panel.closest('.picker'));
    return;
  }
  // closeSheet из js/sheets.js: уход начинается с того места, куда лист дотянули.
  closeSheet(panel);
}

document.addEventListener('pointerdown', (event) => {
  const handle = event.target.closest(HANDLE_SELECTOR);
  // Кнопки и ссылки в заголовке нажимаются как обычно.
  if (!handle || event.button !== 0 || event.target.closest('button, a')) {
    return;
  }
  const panel = handle.closest('.picker__panel') || handle.closest('dialog.sheet');
  drag = {
    panel,
    pointerId: event.pointerId,
    startY: event.clientY,
    startTime: event.timeStamp,
    shift: 0,
  };
  handle.setPointerCapture(event.pointerId);
  panel.style.transition = 'none';
});

document.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  drag.shift = Math.max(0, event.clientY - drag.startY);
  drag.panel.style.transform = `translateY(${drag.shift}px)`;
});

// Не дотянули: inline-сдвиг снимается, и лист возвращается по своему transition из CSS.
// Дотянули: у выпадашки сдвиг снимается в том же кадре, что ставится класс закрытия (переход идёт
// из текущего места), у листа dialog сдвиг остаётся точкой старта анимации ухода, его снимает closeSheet.
function finishDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  const { panel, shift } = drag;
  const speed = shift / Math.max(1, event.timeStamp - drag.startTime);
  const isFlick = shift > FLICK_MIN_SHIFT && speed > FLICK_SPEED;
  const shouldClose = event.type === 'pointerup' && (shift > panel.offsetHeight * CLOSE_SHARE || isFlick);
  drag = null;
  panel.style.transition = '';
  if (!shouldClose || panel.matches('.picker__panel')) {
    panel.style.transform = '';
  }
  if (shouldClose) {
    closePanel(panel);
  }
}

document.addEventListener('pointerup', finishDrag);
document.addEventListener('pointercancel', finishDrag);
