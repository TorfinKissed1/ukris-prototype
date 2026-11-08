// Главная. Шапка стоит в начале страницы. Когда первый экран (data-first-screen) целиком ушёл из окна,
// на компьютере шапка закрепляется и выезжает сверху (header--scrolled, css/header.css),
// на телефоне вместо неё выезжает строка поиска (quickbar--shown, css/mobile.css).
const pageHeader = document.querySelector('[data-header]');
const pageQuickbar = document.querySelector('[data-quickbar]');
const pageFirstScreen = document.querySelector('[data-first-screen]');

const firstScreenObserver = new IntersectionObserver(([entry]) => {
  const passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  pageHeader.classList.toggle('header--scrolled', passed);
  pageQuickbar.classList.toggle('quickbar--shown', passed);
});
firstScreenObserver.observe(pageFirstScreen);
