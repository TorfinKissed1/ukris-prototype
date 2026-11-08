// Сравнение на тестовых данных: колонки строятся по списку из saved.js. Колонки, которые уже
// есть в разметке, переиспользуются, остальные собираются из шаблона #compare-column и
// js/mock-data.js. Без скрипта страница показывает колонки из разметки.

const COMPARE_FADE = 200;

const compareTable = document.querySelector('.compare__table');
const compareHeadRow = compareTable.tHead.rows[0];
const compareBoard = document.querySelector('.compare__board:not(.compare__board--empty)');
const compareEmpty = document.querySelector('.compare__board--empty');
const compareClear = document.querySelector('.compare__clear');
const compareTemplate = document.getElementById('compare-column');
const compareObjects = new Map(window.MOCK_DATA.objects.map((item) => [item.id, item]));
const compareMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Колонки из разметки: заголовок и ячейки по полям, чтобы вернуть их на место без пересборки.
const compareColumns = new Map();
[...compareHeadRow.cells].forEach((head, index) => {
  const cells = {};
  compareTable.querySelectorAll('tr[data-field]').forEach((row) => {
    cells[row.dataset.field] = row.cells[index];
  });
  compareColumns.set(head.dataset.object, { head, cells });
});

function compareFieldValue(item, field) {
  return field === 'place' ? `${item.country}, ${item.city}` : item[field];
}

function buildCompareColumn(item) {
  const head = compareTemplate.content.firstElementChild.cloneNode(true);
  head.dataset.object = item.id;
  head.querySelector('.compare__image').src = item.image;
  head.querySelector('.compare__price').textContent = item.price || 'Цена по запросу';
  // У цены в долларах строка пересчёта пустая, но остаётся: кнопки колонок на одной высоте.
  if (item.priceNote.startsWith('≈')) {
    head.querySelector('.compare__note').textContent = item.priceNote.split(',')[0];
  }
  head.querySelector('.compare__name').textContent = item.title;
  head.querySelector('.compare__tool--favorite').setAttribute('aria-label', `Добавить в избранное: ${item.title}`);
  head.querySelector('.compare__tool--remove').setAttribute('aria-label', `Убрать из сравнения: ${item.title}`);

  const cells = {};
  compareTable.querySelectorAll('tr[data-field]').forEach((row) => {
    const cell = document.createElement('td');
    cell.className = row.dataset.field === 'comment' ? 'compare__cell compare__cell--comment' : 'compare__cell';
    cell.textContent = compareFieldValue(item, row.dataset.field);
    cells[row.dataset.field] = cell;
  });
  return { head, cells };
}

function renderCompare() {
  const ids = window.ProtoSaved.ids('compare').filter((id) => compareObjects.has(id));
  compareBoard.hidden = !ids.length;
  compareClear.hidden = !ids.length;
  compareEmpty.hidden = Boolean(ids.length);

  const columns = ids.map((id) => {
    if (!compareColumns.has(id)) {
      compareColumns.set(id, buildCompareColumn(compareObjects.get(id)));
    }
    return compareColumns.get(id);
  });
  compareHeadRow.replaceChildren(...columns.map((column) => column.head));
  compareTable.querySelectorAll('tr[data-field]').forEach((row) => {
    row.replaceChildren(...columns.map((column) => column.cells[row.dataset.field]));
  });
  compareTable.querySelectorAll('th[colspan]').forEach((head) => {
    head.colSpan = Math.max(ids.length, 1);
  });
  // Кнопки сердечка в новых колонках получают состояние из избранного.
  document.dispatchEvent(new CustomEvent('saved:render'));
}

// Колонка или вся таблица гаснут, и только потом список меняется: таблица не перескакивает резко.
function fadeOut(elements) {
  if (compareMotion.matches) {
    return Promise.resolve();
  }
  const animations = elements.map((element) => element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: COMPARE_FADE, fill: 'forwards' }));
  return Promise.all(animations.map((animation) => animation.finished)).then(() => {
    animations.forEach((animation) => animation.cancel());
  });
}

function fadeIn(element) {
  if (!compareMotion.matches) {
    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: COMPARE_FADE });
  }
}

document.addEventListener('click', (event) => {
  const remove = event.target.closest('.compare__tool--remove');
  if (remove) {
    const id = remove.closest('[data-object]').dataset.object;
    const column = compareColumns.get(id);
    fadeOut([column.head, ...Object.values(column.cells)]).then(() => window.ProtoSaved.remove('compare', id));
    return;
  }
  if (event.target.closest('.compare__clear')) {
    fadeOut([compareBoard, compareClear]).then(() => window.ProtoSaved.clear('compare'));
  }
});

document.addEventListener('saved:change', (event) => {
  if (event.detail.list !== 'compare') {
    return;
  }
  renderCompare();
  if (!compareEmpty.hidden) {
    fadeIn(compareEmpty);
  }
});

renderCompare();
