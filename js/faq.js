// Вопросы на главной. Safari не умеет плавно менять высоту до auto, поэтому высоту блока считает
// скрипт, а двигает Web Animations. Без скрипта и при reduced-motion ответ открывается сразу.

const FAQ_TIMING = { duration: 300, easing: 'ease' };

function toggleFaqItem(item) {
  const question = item.querySelector('.faq__question');
  const answer = item.querySelector('.faq__answer');
  const isOpening = !item.open || item.classList.contains('faq__item--closing');

  // Значения читаются до отмены прежней анимации: нажатие посреди движения разворачивает его с текущего места.
  const fromHeight = item.getBoundingClientRect().height;
  const fromOpacity = item.open ? getComputedStyle(answer).opacity : 0;
  [item, answer].forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));

  item.open = true;
  item.classList.toggle('faq__item--closing', !isOpening);
  const toHeight = (isOpening ? item : question).getBoundingClientRect().height;

  answer.animate({ opacity: [fromOpacity, isOpening ? 1 : 0] }, FAQ_TIMING);
  const movement = item.animate({ height: [`${fromHeight}px`, `${toHeight}px`] }, FAQ_TIMING);
  if (isOpening) {
    return;
  }
  movement.onfinish = () => {
    item.open = false;
    item.classList.remove('faq__item--closing');
  };
}

document.addEventListener('click', (event) => {
  const question = event.target.closest('.faq__question');
  if (!question || REDUCED_MOTION.matches) {
    return;
  }
  event.preventDefault();
  toggleFaqItem(question.closest('.faq__item'));
});
