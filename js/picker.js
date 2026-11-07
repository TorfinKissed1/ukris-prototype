// Выпадающие списки .picker работают и без скрипта (details + радиокнопки).
// Скрипт только делает их удобнее: подставляет выбранное в кнопку, закрывает список
// после выбора, по клику мимо и по Escape, и держит открытым один список за раз.
// На телефоне и планшете список выезжает листом снизу; закрытие сначала уводит лист вниз.

const SHEET_MEDIA = window.matchMedia('(max-width: 1024px)');
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const CLOSE_DURATION = 240;

function closePicker(picker) {
  if (!picker.open || picker.classList.contains('picker--closing')) {
    return;
  }
  if (REDUCED_MOTION.matches) {
    picker.open = false;
    return;
  }
  picker.classList.add('picker--closing');
  window.setTimeout(() => {
    picker.open = false;
    picker.classList.remove('picker--closing');
  }, CLOSE_DURATION);
}

document.addEventListener('change', (event) => {
  const input = event.target.closest('.picker__input');
  if (!input) {
    return;
  }
  const picker = input.closest('.picker');
  const optionText = input.closest('.picker__option').querySelector('.picker__option-text');
  picker.querySelector('.picker__value').textContent = optionText.textContent;
  closePicker(picker);
  // Выбранная радиокнопка прячется вместе со списком, поэтому фокус возвращаем на кнопку выпадашки.
  picker.querySelector('.picker__button').focus({ preventScroll: true });
});

// Пока лист выпадашки открыт, нажатие мимо него (в том числе по кнопке другой выпадашки или по своей)
// только закрывает лист и ничего под ним не нажимает. Ловим на погружении, до раскрытия <details>.
document.addEventListener('click', (event) => {
  const openPicker = document.querySelector('.picker[open]');
  if (!openPicker || openPicker.querySelector('.picker__panel').contains(event.target)) {
    return;
  }
  const ownButton = openPicker.querySelector('.picker__button').contains(event.target);
  if (!SHEET_MEDIA.matches && !ownButton) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  closePicker(openPicker);
}, true);

document.addEventListener('click', (event) => {
  document.querySelectorAll('.picker[open]').forEach((picker) => {
    if (!picker.contains(event.target)) {
      closePicker(picker);
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }
  const openPicker = document.querySelector('.picker[open]');
  if (!openPicker) {
    return;
  }
  // Внутри листа фильтров Escape закрывает сначала список, а не весь лист.
  event.preventDefault();
  closePicker(openPicker);
  openPicker.querySelector('.picker__button').focus();
});

// Событие toggle не всплывает, поэтому ловим его на погружении.
document.addEventListener('toggle', (event) => {
  const picker = event.target;
  if (!picker.matches('.picker') || !picker.open) {
    return;
  }
  document.querySelectorAll('.picker[open]').forEach((other) => {
    if (other !== picker) {
      closePicker(other);
    }
  });
}, true);
