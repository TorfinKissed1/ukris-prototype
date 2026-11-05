// На главной шапка лежит поверх фото прозрачной. Когда первый экран целиком ушёл под шапку,
// она получает белый фон и ужатую строку поиска (стили в css/header.css).
const header = document.querySelector('.header--overlay');
const hero = document.querySelector('.hero');

if (header && hero) {
  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('header--scrolled', !entry.isIntersecting);
  }, { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` });
  observer.observe(hero);
}
