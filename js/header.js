// Шапка стоит в начале страницы. Когда первый экран (элемент с data-first-screen) целиком ушёл
// из окна, шапка получает header--scrolled: закрепляется и выезжает сверху (стили в css/header.css).
const header = document.querySelector('[data-header]');
const firstScreen = document.querySelector('[data-first-screen]');

if (header && firstScreen) {
  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('header--scrolled', !entry.isIntersecting && entry.boundingClientRect.top < 0);
  });
  observer.observe(firstScreen);
}
