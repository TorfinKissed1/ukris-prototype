// Избранное и сравнение на тестовых данных. Списки объектов хранятся в браузере (localStorage):
// кнопки «В избранное» и «К сравнению», счётчики в шапке, нижней панели и меню кабинета берут
// состояние оттуда. Страницы сравнения, кабинета и каталога слушают saved:change, а после
// перерисовки шлют saved:render, чтобы новые кнопки получили состояние.
// На сайте избранное будет храниться в аккаунте, сравнение в браузере.

const SAVED_STORAGE_KEYS = { favorites: 'proto-favorites', compare: 'proto-compare' };
// Пока посетитель ничего не менял, в списках по три объекта, как на макетах.
const SAVED_DEFAULTS = {
  favorites: ['marina-crest-residence', 'palm-garden-villas', 'saadiyat-shore'],
  compare: ['marina-crest-residence', 'palm-garden-villas', 'azure-heights'],
};
// В сравнении не больше четырёх проектов: пятый вытесняет добавленный раньше всех.
const COMPARE_LIMIT = 4;

const FAVORITE_LABEL = { on: 'Убрать из избранного', off: 'Добавить в избранное' };

const SAVED_TOGGLES = [
  { selector: '.project-card__favorite', list: 'favorites', activeClass: 'project-card__favorite--active', label: FAVORITE_LABEL },
  { selector: '.compare__tool--favorite', list: 'favorites', activeClass: 'compare__tool--active', label: FAVORITE_LABEL },
  { selector: '.summary__favorite', list: 'favorites', activeClass: 'summary__tool--active', text: { on: 'В избранном', off: 'В избранное' } },
  { selector: '.project-card__compare, .summary__compare', list: 'compare', text: { on: 'В сравнении', off: 'К сравнению' } },
];

// Ссылки со счётчиком: по адресу понятно, какой список они считают.
const SAVED_COUNTERS = {
  favorites: { href: 'cabinet.html#izbrannoe', title: 'Избранное', cabinetHref: '#izbrannoe' },
  compare: { href: 'compare.html', title: 'Сравнение', cabinetHref: '#sravnenie' },
};

// Хранилище может быть недоступно (закрыто настройками браузера): тогда списки живут до перезагрузки.
function readSavedList(name) {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEYS[name]));
    if (Array.isArray(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Список не прочитан из браузера:', error);
  }
  return [...SAVED_DEFAULTS[name]];
}

const savedLists = { favorites: readSavedList('favorites'), compare: readSavedList('compare') };

function writeSavedList(name) {
  try {
    localStorage.setItem(SAVED_STORAGE_KEYS[name], JSON.stringify(savedLists[name]));
  } catch (error) {
    console.warn('Список не сохранён в браузере:', error);
  }
}

function changeSavedList(name, ids) {
  savedLists[name] = ids;
  writeSavedList(name);
  renderSavedState();
  document.dispatchEvent(new CustomEvent('saved:change', { detail: { list: name } }));
}

window.ProtoSaved = {
  ids: (name) => [...savedLists[name]],
  has: (name, id) => savedLists[name].includes(id),
  remove: (name, id) => changeSavedList(name, savedLists[name].filter((savedId) => savedId !== id)),
  clear: (name) => changeSavedList(name, []),
  toggle(name, id) {
    if (this.has(name, id)) {
      this.remove(name, id);
      return;
    }
    const ids = [...savedLists[name], id];
    if (name === 'compare' && ids.length > COMPARE_LIMIT) {
      ids.shift();
    }
    changeSavedList(name, ids);
  },
};

// В подписи после двоеточия может стоять название объекта («Убрать из избранного: Harbour View»), оно сохраняется.
function swapLabel(button, label) {
  const current = button.getAttribute('aria-label') || '';
  const objectName = current.includes(': ') ? current.slice(current.indexOf(': ')) : '';
  button.setAttribute('aria-label', label + objectName);
}

// Текст кнопки стоит последним после иконки.
function swapText(button, text) {
  const textNode = [...button.childNodes].reverse().find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
  if (textNode) {
    textNode.nodeValue = text;
  }
}

function objectIdOf(button) {
  return button.closest('[data-object]').dataset.object;
}

function renderToggle(toggle, button) {
  const pressed = window.ProtoSaved.has(toggle.list, objectIdOf(button));
  button.setAttribute('aria-pressed', String(pressed));
  if (toggle.activeClass) {
    button.classList.toggle(toggle.activeClass, pressed);
  }
  if (toggle.label) {
    swapLabel(button, pressed ? toggle.label.on : toggle.label.off);
  }
  if (toggle.text) {
    swapText(button, pressed ? toggle.text.on : toggle.text.off);
  }
}

function renderCounter(name) {
  const count = savedLists[name].length;
  const { href, title, cabinetHref } = SAVED_COUNTERS[name];
  document.querySelectorAll(`.header__tool[href="${href}"]`).forEach((link) => {
    link.setAttribute('aria-label', count ? `${title}, объектов: ${count}` : title);
    const badge = link.querySelector('.header__badge');
    badge.textContent = count;
    badge.hidden = !count;
  });
  document.querySelectorAll(`.tabbar__item[href="${href}"] .tabbar__badge`).forEach((badge) => {
    badge.textContent = count;
    badge.setAttribute('aria-label', `объектов: ${count}`);
    badge.hidden = !count;
  });
  document.querySelectorAll(`.cabinet__link[href="${cabinetHref}"] .cabinet__count`).forEach((badge) => {
    badge.textContent = count;
  });
}

function renderSavedState() {
  for (const toggle of SAVED_TOGGLES) {
    document.querySelectorAll(toggle.selector).forEach((button) => renderToggle(toggle, button));
  }
  renderCounter('favorites');
  renderCounter('compare');
}

document.addEventListener('click', (event) => {
  for (const toggle of SAVED_TOGGLES) {
    const button = event.target.closest(toggle.selector);
    if (button) {
      window.ProtoSaved.toggle(toggle.list, objectIdOf(button));
      return;
    }
  }
});

document.addEventListener('saved:render', renderSavedState);

renderSavedState();
