// Панель управления: фильтры списков, выгрузка CSV, сохранение форм, фото и повторяющиеся блоки объекта.
// Работает на тестовых строках страницы, на сайте всё это делает сервер.

const ADMIN_SAVED_DURATION = 1600;
const ADMIN_BADGE_BY_STATUS = { new: 'new', work: 'work', deal: 'done', refused: 'off' };

function adminFilterValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function adminRowMatches(row, values) {
  const { q = '', from = '', to = '', ...exact } = values;
  if (q && !foldText(row.dataset.text || row.textContent).includes(foldText(q.trim()))) {
    return false;
  }
  if ((from && row.dataset.date < from) || (to && row.dataset.date > to)) {
    return false;
  }
  return Object.entries(exact).every(([name, value]) => !value || row.dataset[name] === value);
}

function applyAdminFilters(form) {
  const box = document.querySelector('[data-admin-list]');
  const rows = [...box.querySelectorAll('[data-admin-row]')];
  const values = adminFilterValues(form);
  rows.forEach((row) => {
    row.hidden = !adminRowMatches(row, values);
  });
  const found = rows.filter((row) => !row.hidden).length;
  document.querySelector('[data-admin-count]').textContent = `Найдено: ${found}`;
  box.hidden = found === 0;
  document.querySelector('[data-admin-empty]').hidden = found !== 0;
  fadeIn(found === 0 ? document.querySelector('[data-admin-empty]') : box);
}

function resetAdminFilters(form) {
  form.reset();
  syncPickerLabels(form);
  applyAdminFilters(form);
}

function exportAdminCsv(button) {
  const table = document.querySelector('[data-admin-list] table');
  const clean = (element) => `"${element.textContent.replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`;
  const rows = [...table.querySelectorAll('[data-admin-row]:not([hidden])')].map((row) => [...row.cells].map(clean).join(';'));
  const header = [...table.querySelectorAll('th')].map(clean).join(';');
  // Метка кодировки в начале файла: без неё Excel показывает кириллицу кракозябрами.
  const file = new Blob([`﻿${[header, ...rows].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = button.dataset.exportCsv;
  link.click();
  URL.revokeObjectURL(link.href);
}

function markAdminSaved(button) {
  const label = button.textContent;
  button.textContent = 'Сохранено';
  window.setTimeout(() => {
    button.textContent = label;
  }, ADMIN_SAVED_DURATION);
}

function applyAdminLeadStatus(form) {
  const checked = form.querySelector('input[name="status"]:checked');
  const text = checked.nextElementSibling.textContent;
  const badge = document.querySelector('[data-lead-status]');
  badge.textContent = text;
  badge.className = `admin-badge admin-badge--${ADMIN_BADGE_BY_STATUS[checked.value]}`;
  const entry = document.createElement('li');
  entry.className = 'admin-log__item';
  entry.innerHTML = '<span></span><span class="admin-log__time"></span>';
  entry.firstChild.textContent = text;
  entry.lastChild.textContent = new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
  document.querySelector('[data-lead-history]').prepend(entry);
  fadeIn(entry);
}

function addAdminReferenceRow(form) {
  const section = form.closest('[data-reference]');
  const row = section.querySelector('template').content.firstElementChild.cloneNode(true);
  row.querySelectorAll('[data-slot]').forEach((slot) => {
    const field = form.elements[slot.dataset.slot];
    if (field.files) {
      slot.textContent = field.files.length ? 'Загружено' : 'Нет';
    } else {
      slot.textContent = field.value;
    }
  });
  section.querySelector('tbody').prepend(row);
  form.reset();
  syncPickerLabels(form);
  fadeIn(row);
}

function removeAdminElement(element) {
  fadeOut([element]).then(() => element.remove());
}

function addAdminGalleryPhotos(input) {
  const gallery = document.querySelector('[data-gallery]');
  const template = document.querySelector('#gallery-item');
  [...input.files].forEach((file) => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.querySelector('img').src = URL.createObjectURL(file);
    gallery.append(item);
    fadeIn(item);
  });
  input.value = '';
  refreshAdminChecks();
}

function moveAdminGalleryItem(item, step) {
  const neighbour = step < 0 ? item.previousElementSibling : item.nextElementSibling;
  if (!neighbour) {
    return;
  }
  neighbour[step < 0 ? 'before' : 'after'](item);
  fadeIn(item);
}

// Без обязательных полей статус «Опубликован» недоступен, список справа называет, чего не хватает.
function refreshAdminChecks() {
  const form = document.querySelector('[data-object-form]');
  if (!form) {
    return;
  }
  let missing = 0;
  form.querySelectorAll('[data-check]').forEach((item) => {
    const name = item.dataset.check;
    const filled = name === 'gallery'
      ? document.querySelector('[data-gallery]').children.length > 0
      : form.elements[name].value.trim() !== '';
    item.classList.toggle('admin-checks__item--miss', !filled);
    item.querySelector('use').setAttribute('href', filled ? '#i-check' : '#i-close');
    missing += filled ? 0 : 1;
  });
  const published = form.querySelector('input[name="state"][value="published"]');
  published.disabled = missing > 0;
  if (missing > 0 && published.checked) {
    form.querySelector('input[name="state"][value="draft"]').checked = true;
  }
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (event.defaultPrevented) {
    return;
  }
  if (form.matches('[data-admin-filters]')) {
    event.preventDefault();
    applyAdminFilters(form);
  } else if (form.matches('[data-reference-add]')) {
    event.preventDefault();
    addAdminReferenceRow(form);
  } else if (form.matches('[data-admin-save]')) {
    event.preventDefault();
    if (form.matches('[data-lead-form]')) {
      applyAdminLeadStatus(form);
    }
    markAdminSaved(form.querySelector('button[type="submit"]'));
  }
});

document.addEventListener('input', (event) => {
  const filters = event.target.closest('[data-admin-filters]');
  if (filters) {
    applyAdminFilters(filters);
  }
  if (event.target.closest('[data-object-form]')) {
    refreshAdminChecks();
  }
  if (event.target.matches('[data-gallery-input]')) {
    addAdminGalleryPhotos(event.target);
  }
  if (event.target.matches('[data-file-input]')) {
    const text = event.target.parentElement.querySelector('[data-file-text]');
    text.textContent = event.target.files.length ? event.target.files[0].name : text.dataset.empty;
  }
});

document.addEventListener('reset', (event) => {
  event.target.querySelectorAll('[data-file-text]').forEach((text) => {
    text.textContent = text.dataset.empty;
  });
});

document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target) {
    return;
  }
  if (target.matches('[data-filters-reset]')) {
    resetAdminFilters(target.closest('form'));
  } else if (target.matches('[data-export-csv]')) {
    exportAdminCsv(target);
  } else if (target.matches('[data-resend]')) {
    const item = target.closest('.admin-log__item');
    item.querySelector('.admin-badge').className = 'admin-badge admin-badge--work';
    item.querySelector('.admin-badge').textContent = 'Отправлено';
    target.remove();
  } else if (target.matches('[data-gallery-move]')) {
    moveAdminGalleryItem(target.closest('.admin-gallery__item'), Number(target.dataset.galleryMove));
  } else if (target.matches('[data-gallery-remove]')) {
    target.closest('.admin-gallery__item').remove();
    refreshAdminChecks();
  } else if (target.matches('[data-repeat-add]')) {
    const row = document.querySelector(`#${target.dataset.repeatAdd}`).content.firstElementChild.cloneNode(true);
    target.previousElementSibling.append(row);
    fadeIn(row);
  } else if (target.matches('[data-repeat-remove]')) {
    removeAdminElement(target.closest('.admin-repeat__item'));
  } else if (target.matches('[data-row-remove]')) {
    removeAdminElement(target.closest('tr'));
  } else if (target.matches('[data-user-delete]')) {
    const dialog = document.querySelector('#delete-user');
    dialog.dataset.row = target.closest('tr').id;
    openSheet(dialog);
  } else if (target.matches('[data-anonymize-confirm]')) {
    document.querySelectorAll('[data-personal]').forEach((value) => {
      value.textContent = 'Обезличено';
    });
    document.querySelector('[data-sheet-open="anonymize-lead"]').remove();
    closeSheet(target.closest('dialog'));
  } else if (target.matches('[data-user-delete-confirm]')) {
    const dialog = target.closest('dialog');
    removeAdminElement(document.getElementById(dialog.dataset.row));
    closeSheet(dialog);
  }
});

refreshAdminChecks();
