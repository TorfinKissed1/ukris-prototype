// Фильтры и сортировка каталога на тестовых данных (js/mock-data.js). Работают, когда в адресе
// есть фильтр (форма фильтров отправляет все поля, таблетки и сортировка ведут на такой адрес):
// выдача, итог, заголовок, таблетки и поля фильтров строятся по адресу. Без фильтров в адресе
// страница остаётся как в разметке. На сайте всё это сделает сервер.

const CATALOG_FILTERS = ['country', 'city', 'budget_min', 'budget_max', 'type', 'keys', 'q'];
const CATALOG_COUNTRY_IN = { oae: 'в ОАЭ', turkey: 'в Турции', thailand: 'в Таиланде' };
const CATALOG_SORTS = {
  price_asc: (a, b) => (a.priceUsd ?? Infinity) - (b.priceUsd ?? Infinity),
  price_desc: (a, b) => (b.priceUsd ?? -Infinity) - (a.priceUsd ?? -Infinity),
  keys: (a, b) => (a.keys === 'done' ? 0 : Number(a.keys)) - (b.keys === 'done' ? 0 : Number(b.keys)),
};

const catalogParams = new URLSearchParams(location.search);
const catalogObjects = window.MOCK_DATA.objects;

function catalogNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? Number(digits) : null;
}

// Название значения фильтра берём из данных: в выпадашке города есть не все города.
function catalogLabel(name, value) {
  const field = { country: 'country', city: 'city', type: 'type' }[name];
  if (field) {
    return catalogObjects.find((item) => item[`${field}Id`] === value)?.[field] || value;
  }
  const money = (amount) => `${amount.toLocaleString('ru-RU')} $`;
  if (name === 'budget_min') {
    return `От ${money(value)}`;
  }
  if (name === 'budget_max') {
    return `До ${money(value)}`;
  }
  if (name === 'keys') {
    return value === 'done' ? 'Сдан' : `Ключи: ${value}`;
  }
  return `«${value}»`;
}

function catalogMatches(item, filters) {
  const min = filters.budget_min === '' ? null : filters.budget_min;
  const max = filters.budget_max === '' ? null : filters.budget_max;
  return (!filters.country || item.countryId === filters.country)
    && (!filters.city || item.cityId === filters.city)
    && (!filters.type || item.typeId === filters.type)
    && (!filters.keys || item.keys === filters.keys)
    // Цена по запросу под бюджет не попадает: сравнить не с чем.
    && (min === null || (item.priceUsd !== null && item.priceUsd >= min))
    && (max === null || (item.priceUsd !== null && item.priceUsd <= max))
    && (!filters.q || objectSearchText(item).includes(foldText(filters.q)));
}

function catalogUrl(params) {
  const query = params.toString();
  return `catalog.html?${query || 'country='}`;
}

// Выпадашки и поля фильтров на странице и в окне подбора показывают то, что в адресе.
function syncCatalogFields(filters) {
  document.querySelectorAll('.picker').forEach((picker) => {
    const name = picker.querySelector('.picker__input')?.name;
    if (!['country', 'city', 'type', 'keys'].includes(name)) {
      return;
    }
    const value = filters[name] || '';
    picker.querySelectorAll('.picker__input').forEach((input) => {
      input.checked = input.value === value;
    });
    // Значения из адреса может не быть среди вариантов (Пхукет в выпадашке городов ОАЭ): подпись из данных.
    const checked = picker.querySelector('.picker__input:checked');
    picker.querySelector('.picker__value').textContent = checked
      ? checked.closest('.picker__option').querySelector('.picker__option-text').textContent
      : catalogLabel(name, value);
  });
  document.querySelectorAll('input[name="budget_min"]').forEach((input) => { input.value = filters.budget_min || ''; });
  document.querySelectorAll('input[name="budget_max"]').forEach((input) => { input.value = filters.budget_max || ''; });
  // В окне подбора одно поле бюджета: подставляем верхнюю границу фильтра.
  document.querySelectorAll('input[name="budget_usd"]').forEach((input) => { input.value = filters.budget_max || ''; });
  document.querySelectorAll('.finder__query-input, .quickbar__input').forEach((input) => { input.value = filters.q || ''; });
}

function buildCatalogChips(filters) {
  const chips = document.querySelector('.catalog__chips');
  const active = CATALOG_FILTERS.filter((name) => filters[name]);
  const links = active.map((name) => {
    const params = new URLSearchParams(catalogParams);
    params.delete(name);
    params.delete('sort');
    const label = catalogLabel(name, filters[name]);
    const link = document.createElement('a');
    link.className = 'chips__item';
    link.href = catalogUrl(params);
    link.setAttribute('aria-label', `Убрать фильтр: ${label}`);
    link.innerHTML = '<span class="chips__remove"><svg class="icon chips__icon" aria-hidden="true"><use href="#i-close"></use></svg></span>';
    link.prepend(label);
    return link;
  });
  const reset = chips.querySelector('.chips__reset');
  reset.href = catalogUrl(new URLSearchParams());
  const nodes = [...links];
  // Видно шесть таблеток, остальные за «Ещё N» (раскрывает CSS по флажку).
  if (links.length > 6) {
    const toggle = document.createElement('input');
    toggle.className = 'chips__toggle visually-hidden';
    toggle.type = 'checkbox';
    toggle.id = 'chips-more';
    const more = document.createElement('label');
    more.className = 'chips__more';
    more.htmlFor = 'chips-more';
    more.textContent = `Ещё ${links.length - 6}`;
    nodes.push(toggle, more);
  }
  reset.hidden = !links.length;
  chips.replaceChildren(...nodes, reset);
}

function syncCatalogSort(sort) {
  document.querySelectorAll('.catalog__sort-picker .picker__option, #sort .sheet__option').forEach((option) => {
    const optionUrl = new URL(option.href);
    const params = new URLSearchParams(catalogParams);
    params.delete('sort');
    if (optionUrl.searchParams.get('sort')) {
      params.set('sort', optionUrl.searchParams.get('sort'));
    }
    const current = (optionUrl.searchParams.get('sort') || '') === sort;
    option.href = catalogUrl(params);
    const sheetOption = option.classList.contains('sheet__option');
    option.classList.toggle(sheetOption ? 'sheet__option--current' : 'picker__option--current', current);
    if (current) {
      option.setAttribute('aria-current', 'true');
    } else {
      option.removeAttribute('aria-current');
    }
  });
  // Галочка в листе сортировки одна, переезжает к текущему пункту.
  const check = document.querySelector('#sort .sheet__option-check');
  document.querySelector('#sort .sheet__option--current')?.append(check);
  const currentText = document.querySelector('.catalog__sort-picker .picker__option--current .picker__option-text').textContent;
  document.querySelector('.catalog__sort-picker .picker__value').textContent = currentText;
  const button = document.querySelector('.catalog__sort-button');
  button.firstChild.nodeValue = currentText;
}

function applyCatalogFilters() {
  if (!CATALOG_FILTERS.some((name) => catalogParams.has(name))) {
    return;
  }
  const filters = Object.fromEntries(CATALOG_FILTERS.map((name) => [name, (catalogParams.get(name) || '').trim()]));
  // Бюджет без цифр («abc») считается пустым, а не ломает подписи таблеток.
  filters.budget_min = catalogNumber(filters.budget_min) ?? '';
  filters.budget_max = catalogNumber(filters.budget_max) ?? '';
  const sort = CATALOG_SORTS[catalogParams.get('sort')] ? catalogParams.get('sort') : '';
  const found = catalogObjects.filter((item) => catalogMatches(item, filters));
  if (sort) {
    found.sort(CATALOG_SORTS[sort]);
  }

  const list = document.querySelector('.catalog__content .projects');
  const template = document.getElementById('catalog-card');
  const cards = new Map([...list.children].map((card) => [card.dataset.object, card]));
  list.replaceChildren(...found.map((item) => cards.get(item.id) || buildProjectCard(template, item)));

  const countryName = filters.country ? catalogLabel('country', filters.country) : 'Все страны';
  document.querySelector('.catalog__title').textContent = filters.country
    ? `Новостройки ${CATALOG_COUNTRY_IN[filters.country] || countryName}`
    : 'Все новостройки';
  document.querySelector('.catalog__crumbs .crumbs__current').textContent = countryName;
  document.querySelector('.catalog__count').textContent = `${plural(found.length, 'Найден', 'Найдено', 'Найдено')} ${objectsCount(found.length)}`;

  list.hidden = !found.length;
  document.querySelector('.catalog__content .empty').hidden = Boolean(found.length);
  document.querySelector('.catalog__tools').hidden = !found.length;
  // Тестовых объектов меньше страницы: листать нечего.
  document.querySelector('.pagination').hidden = true;

  // Число на кнопке «Фильтры»: поиск по словам стоит в самой строке и не считается.
  const filtersCount = CATALOG_FILTERS.filter((name) => name !== 'q' && filters[name]).length;
  const filtersButton = document.querySelector('.quickbar__filters');
  const filtersBadge = filtersButton.querySelector('.quickbar__count');
  filtersBadge.textContent = filtersCount;
  filtersBadge.hidden = !filtersCount;
  filtersButton.setAttribute('aria-label', filtersCount ? `Фильтры, выбрано: ${filtersCount}` : 'Фильтры');

  syncCatalogFields(filters);
  buildCatalogChips(filters);
  syncCatalogSort(sort);
  document.dispatchEvent(new CustomEvent('saved:render'));
}

applyCatalogFilters();
