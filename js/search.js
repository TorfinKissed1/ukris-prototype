// Поиск на весь экран на телефоне и планшете (до 1024 px). Нажатие на строку поиска открывает
// лист #search: сверху характеристики из справочника (страна, город, тип, застройщик) с числом
// объектов, ниже объекты по словам. На компьютере и без скрипта строка поиска работает как
// обычная форма и отправляет запрос в каталог. Данные тестовые, из js/mock-data.js.

const SEARCH_MEDIA = window.matchMedia('(max-width: 1024px)');
const SEARCH_SOURCES = '.quickbar__input, .finder__query-input';
// Подсказок-характеристик не больше трёх: это подсказка, куда свернуть поиск, а не второй фильтр.
const SEARCH_FACETS_LIMIT = 3;
const SEARCH_OBJECTS_LIMIT = 6;
const SEARCH_NOTHING = 'Ничего не нашлось. Попробуйте другое слово, город или тип объекта.';

const searchSheet = document.getElementById('search');
const searchData = window.MOCK_DATA;
let searchSource = null;
let searchRestoringFocus = false;
let searchFromKeyboard = false;
let searchLastPointer = -Infinity;

// «ё» сравнивается как «е»: «Орел» находит Орёл.
function foldText(text) {
  return text.toLowerCase().replace(/ё/g, 'е');
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

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) {
    node.textContent = text;
  }
  return node;
}

function facetRow(facet) {
  const link = element('a', 'search-sheet__row');
  link.href = facet.url;
  link.append(element('span', 'search-sheet__row-title', facet.title));
  link.append(element('span', 'search-sheet__row-hint', `${facet.kind} · ${objectsCount(facet.count)}`));
  return link;
}

function facetChip(facet) {
  const link = element('a', 'search-sheet__chip', facet.title);
  link.href = facet.url;
  link.append(element('span', 'search-sheet__chip-count', String(facet.count)));
  link.setAttribute('aria-label', `${facet.title}, ${facet.kind.toLowerCase()}, ${objectsCount(facet.count)}`);
  return link;
}

function objectRow(item) {
  const link = element('a', 'search-sheet__object');
  link.href = item.url;
  const image = element('img', 'search-sheet__image');
  image.src = item.image;
  image.alt = '';
  image.loading = 'lazy';
  const text = element('span', 'search-sheet__object-text');
  text.append(element('span', 'search-sheet__row-title', item.title));
  text.append(element('span', 'search-sheet__row-hint', `${item.price || 'Цена по запросу'} · ${item.country}, ${item.city}`));
  link.append(image, text);
  return link;
}

function section(title, nodes, listClass) {
  const block = element('section', 'search-sheet__section');
  block.append(element('h2', 'search-sheet__label', title));
  const list = element('div', listClass);
  list.append(...nodes);
  block.append(list);
  return block;
}

function matchesObject(item, needle) {
  const haystack = foldText([item.title, item.country, item.city, item.developer, item.type].join(' '));
  return haystack.includes(needle);
}

function renderSearch() {
  const query = searchSheet.querySelector('.search-sheet__input').value.trim();
  const results = searchSheet.querySelector('.search-sheet__results');
  const sections = [];

  if (query === '') {
    // Пустое поле: справочник строками, в строку помещается число объектов.
    sections.push(section('Характеристики', searchData.facets.slice(0, SEARCH_OBJECTS_LIMIT).map(facetRow), 'search-sheet__rows'));
  } else {
    const needle = foldText(query);
    const facets = searchData.facets.filter((facet) => foldText(facet.title).includes(needle)).slice(0, SEARCH_FACETS_LIMIT);
    const objects = searchData.objects.filter((item) => matchesObject(item, needle)).slice(0, SEARCH_OBJECTS_LIMIT);
    if (facets.length) {
      sections.push(section('Характеристики', facets.map(facetChip), 'search-sheet__chips'));
    }
    if (objects.length) {
      sections.push(section('Объекты', objects.map(objectRow), 'search-sheet__rows'));
    }
    if (!sections.length) {
      sections.push(element('p', 'search-sheet__note', SEARCH_NOTHING));
    }
  }
  results.replaceChildren(...sections);
}

function openSearch(source, fromKeyboard) {
  // На iPhone касание поля даёт и фокус, и нажатие: лист открывается один раз.
  if (searchSheet.open) {
    return;
  }
  searchSource = source;
  searchFromKeyboard = fromKeyboard;
  const input = searchSheet.querySelector('.search-sheet__input');
  input.value = source.value;
  renderSearch();
  // Строку на странице уводим из фокуса, иначе после закрытия dialog вернул бы фокус в неё
  // и лист открылся бы снова.
  source.blur();
  openSheet(searchSheet);
  // Фокус в том же нажатии: так iPhone сразу показывает клавиатуру.
  input.focus();
}

if (searchSheet) {
  // Касание не отменяем: в WebKit отмена pointerdown гасит и фокус, и нажатие. Поле получает фокус,
  // и обработчик focusin ниже сразу переносит его в лист, в том же нажатии.
  document.addEventListener('pointerdown', (event) => {
    searchLastPointer = event.timeStamp;
  });

  document.addEventListener('click', (event) => {
    const source = event.target.closest(SEARCH_SOURCES);
    if (source && SEARCH_MEDIA.matches) {
      event.preventDefault();
      openSearch(source, false);
    }
  });

  // Фокус без касания перед ним это переход с клавиатуры (Tab): тоже открываем лист.
  document.addEventListener('focusin', (event) => {
    const source = event.target.closest(SEARCH_SOURCES);
    if (!source || !SEARCH_MEDIA.matches || searchRestoringFocus) {
      return;
    }
    openSearch(source, event.timeStamp - searchLastPointer > 1000);
  });

  searchSheet.querySelector('.search-sheet__input').addEventListener('input', renderSearch);

  // Набранное возвращается в строку на странице. Фокус возвращается только тем, кто пришёл
  // с клавиатуры: на телефоне фокус в поле поднял бы клавиатуру заново.
  searchSheet.addEventListener('close', () => {
    if (!searchSource) {
      return;
    }
    searchSource.value = searchSheet.querySelector('.search-sheet__input').value;
    if (searchFromKeyboard) {
      searchRestoringFocus = true;
      searchSource.focus({ preventScroll: true });
      searchRestoringFocus = false;
    }
    searchSource = null;
  });
}
