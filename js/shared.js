// Общие помощники. Скрипты обычные, не модули (страницы открываются и через file://), поэтому
// объявленное здесь видно остальным. Подключается сразу после js/mock-data.js, раньше других скриптов.

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
// До этой ширины выпадашки становятся листами снизу, а поиск открывается на весь экран.
const MOBILE_MEDIA = window.matchMedia('(max-width: 1024px)');
const FADE_DURATION = 200;

const PRICE_ON_REQUEST = 'Цена по запросу';
const OBJECTS_BY_ID = new Map(window.MOCK_DATA.objects.map((item) => [item.id, item]));

// «ё» сравнивается как «е»: «Орел» находит Орёл.
function foldText(text) {
  return text.toLowerCase().replace(/ё/g, 'е');
}

function objectSearchText(item) {
  return foldText([item.title, item.country, item.city, item.developer, item.type].join(' '));
}

function objectPlace(item) {
  return `${item.country}, ${item.city}`;
}

function plural(count, one, few, many) {
  const tens = count % 100;
  const units = count % 10;
  if (tens >= 11 && tens <= 14) {
    return many;
  }
  if (units === 1) {
    return one;
  }
  return units >= 2 && units <= 4 ? few : many;
}

function objectsCount(count) {
  return `${count} ${plural(count, 'объект', 'объекта', 'объектов')}`;
}

// Элементы гаснут, и только потом вызывающий меняет список: таблица и сетка не перескакивают резко.
function fadeOut(elements) {
  if (REDUCED_MOTION.matches) {
    return Promise.resolve();
  }
  const animations = elements.map((element) => element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_DURATION, fill: 'forwards' }));
  return Promise.all(animations.map((animation) => animation.finished)).then(() => {
    animations.forEach((animation) => animation.cancel());
  });
}

function fadeIn(element) {
  if (!REDUCED_MOTION.matches) {
    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_DURATION });
  }
}
