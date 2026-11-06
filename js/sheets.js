// Листы (dialog.sheet) и очистка строки поиска сверху.
// Кнопки открытия это ссылки на #id: без скрипта лист открывается через :target, со скриптом
// открывается модально, а выезд и уход анимирует CSS. Escape и возврат фокуса даёт сам dialog.

function openSheet(sheet) {
  sheet.showModal();
  const title = sheet.querySelector('.sheet__title');
  if (title) {
    title.focus();
  }
}

// Ссылка вида catalog.html#filters без скрипта открыла бы лист через :target, без модальности.
// Со скриптом открываем его как обычно и убираем #filters из адреса.
const sheetFromHash = location.hash ? document.getElementById(location.hash.slice(1)) : null;
if (sheetFromHash && sheetFromHash.matches('dialog.sheet') && typeof sheetFromHash.showModal === 'function') {
  history.replaceState(null, '', location.pathname + location.search);
  openSheet(sheetFromHash);
}

document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-sheet-open]');
  if (opener) {
    const sheet = document.getElementById(opener.dataset.sheetOpen);
    if (sheet && typeof sheet.showModal === 'function') {
      event.preventDefault();
      openSheet(sheet);
    }
    return;
  }

  const closer = event.target.closest('[data-sheet-close]');
  if (closer) {
    const sheet = closer.closest('dialog');
    if (sheet && sheet.open) {
      event.preventDefault();
      sheet.close();
    }
    return;
  }

  // Нажатие на затемнение вокруг листа приходит на сам dialog.
  if (event.target.matches('dialog.sheet[open]')) {
    event.target.close();
    return;
  }

  const clear = event.target.closest('.quickbar__clear');
  if (clear) {
    const input = clear.parentElement.querySelector('.quickbar__input');
    input.value = '';
    input.focus();
  }
});
