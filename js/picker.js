// Выпадающие списки .picker работают и без скрипта (details + радиокнопки).
// Скрипт только делает их удобнее: подставляет выбранное в кнопку, закрывает список
// после выбора, по клику мимо и по Escape, и держит открытым один список за раз.

function closePicker(picker) {
  picker.open = false;
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
});

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
