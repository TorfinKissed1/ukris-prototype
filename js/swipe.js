// Закрытие листов свайпом вниз за ручку или заголовок: лист снизу (dialog.sheet--bottom) и лист
// выпадашки на телефоне (.picker__panel). Лист едет за пальцем; отпустили дальше четверти высоты
// листа или резко смахнули вниз, лист закрывается, иначе возвращается на место.
// Без скрипта выпадашка закрывается повторным нажатием на её кнопку, нижний лист выбором пункта.

const SWIPE_HANDLE_SELECTOR = '.sheet--bottom .sheet__grabber, .sheet--bottom .sheet__head, .picker__head';
const SWIPE_CLOSE_SHARE = 0.25;
const SWIPE_FLICK_MIN_SHIFT = 20;
const SWIPE_FLICK_SPEED = 0.5; // пикселей в миллисекунду

let swipeDrag = null;

function closeSwipedPanel(panel) {
  if (panel.matches('.picker__panel')) {
    // closePicker из js/picker.js уводит лист вниз и закрывает выпадашку.
    closePicker(panel.closest('.picker'));
    return;
  }
  // closeSheet из js/sheets.js: уход начинается с того места, куда лист дотянули.
  closeSheet(panel);
}

document.addEventListener('pointerdown', (event) => {
  const handle = event.target.closest(SWIPE_HANDLE_SELECTOR);
  // Кнопки и ссылки в заголовке нажимаются как обычно.
  if (!handle || event.button !== 0 || event.target.closest('button, a')) {
    return;
  }
  const panel = handle.closest('.picker__panel') || handle.closest('dialog.sheet');
  swipeDrag = {
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
  if (!swipeDrag || event.pointerId !== swipeDrag.pointerId) {
    return;
  }
  swipeDrag.shift = Math.max(0, event.clientY - swipeDrag.startY);
  swipeDrag.panel.style.transform = `translateY(${swipeDrag.shift}px)`;
});

// Не дотянули: inline-сдвиг снимается, и лист возвращается по своему transition из CSS.
// Дотянули: у выпадашки сдвиг снимается в том же кадре, что ставится класс закрытия (переход идёт
// из текущего места), у листа dialog сдвиг остаётся точкой старта анимации ухода, его снимает closeSheet.
function finishSwipeDrag(event) {
  if (!swipeDrag || event.pointerId !== swipeDrag.pointerId) {
    return;
  }
  const { panel, shift } = swipeDrag;
  const speed = shift / Math.max(1, event.timeStamp - swipeDrag.startTime);
  const isFlick = shift > SWIPE_FLICK_MIN_SHIFT && speed > SWIPE_FLICK_SPEED;
  const shouldClose = event.type === 'pointerup' && (shift > panel.offsetHeight * SWIPE_CLOSE_SHARE || isFlick);
  swipeDrag = null;
  panel.style.transition = '';
  if (!shouldClose || panel.matches('.picker__panel')) {
    panel.style.transform = '';
  }
  if (shouldClose) {
    closeSwipedPanel(panel);
  }
}

document.addEventListener('pointerup', finishSwipeDrag);
document.addEventListener('pointercancel', finishSwipeDrag);
