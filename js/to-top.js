// Кнопка «наверх» появляется, когда прокручен первый экран. Без скрипта она просто не видна.
const toTop = document.querySelector('.to-top');

if (toTop) {
  const update = () => toTop.classList.toggle('to-top--visible', window.scrollY > window.innerHeight);
  update();
  window.addEventListener('scroll', update, { passive: true });
}
