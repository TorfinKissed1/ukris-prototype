// Главная. Шапка стоит в начале страницы. Когда первый экран (data-first-screen) целиком ушёл из окна,
// на компьютере шапка закрепляется и выезжает сверху (header--scrolled, css/header.css),
// на телефоне вместо неё выезжает строка поиска (quickbar--shown, css/mobile.css).
const header = document.querySelector('[data-header]');
const quickbar = document.querySelector('[data-quickbar]');
const firstScreen = document.querySelector('[data-first-screen]');

const observer = new IntersectionObserver(([entry]) => {
  const passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  header.classList.toggle('header--scrolled', passed);
  quickbar.classList.toggle('quickbar--shown', passed);
});
observer.observe(firstScreen);
