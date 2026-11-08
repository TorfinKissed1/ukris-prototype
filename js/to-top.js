// Кнопка «наверх» появляется, когда прокручен первый экран. Без скрипта она просто не видна.
const toTopButton = document.querySelector('.to-top');

if (toTopButton) {
  const update = () => toTopButton.classList.toggle('to-top--visible', window.scrollY > window.innerHeight);
  update();
  window.addEventListener('scroll', update, { passive: true });
}
