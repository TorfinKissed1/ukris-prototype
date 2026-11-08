// Листы (dialog.sheet) и очистка строки поиска сверху.
// Кнопки открытия это ссылки на #id: без скрипта лист открывается через :target, со скриптом
// открывается модально. Выезд анимирует CSS, уход тоже, но запускается отсюда: класс sheet--closing,
// и dialog закрывается, когда анимация доиграла. Возврат фокуса даёт сам dialog.

// Запас на случай, если animationend не придёт: анимация ухода длится 240 мс.
const SHEET_CLOSE_FALLBACK = 400;

function closeSheet(sheet) {
  if (!sheet.open || sheet.classList.contains('sheet--closing')) {
    return;
  }
  if (REDUCED_MOTION.matches) {
    sheet.close();
    return;
  }
  let fallback = 0;
  const finish = (event) => {
    // animationend всплывает и от анимаций внутри листа (выпадашки), ждём только свою.
    if (event && event.target !== sheet) {
      return;
    }
    sheet.removeEventListener('animationend', finish);
    window.clearTimeout(fallback);
    sheet.close();
    sheet.classList.remove('sheet--closing');
    // Сдвиг, оставленный свайпом (js/swipe.js), нужен анимации ухода как точка старта.
    sheet.style.transform = '';
  };
  sheet.addEventListener('animationend', finish);
  fallback = window.setTimeout(finish, SHEET_CLOSE_FALLBACK);
  sheet.classList.add('sheet--closing');
}

// Escape закрывает лист тем же плавным уходом, а не сразу.
document.addEventListener('cancel', (event) => {
  if (event.target.matches('dialog.sheet')) {
    event.preventDefault();
    closeSheet(event.target);
  }
}, true);

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
      closeSheet(sheet);
    }
    return;
  }

  // Раздел этой же страницы: браузер только прокрутит к нему, а лист остался бы открытым.
  const sectionLink = event.target.closest('.sheet__option[href*="#"]');
  if (sectionLink && sectionLink.pathname === location.pathname) {
    closeSheet(sectionLink.closest('dialog'));
    return;
  }

  // Нажатие на затемнение вокруг листа приходит на сам dialog.
  if (event.target.matches('dialog.sheet[open]')) {
    closeSheet(event.target);
    return;
  }

  const clear = event.target.closest('.quickbar__clear');
  if (clear) {
    const input = clear.parentElement.querySelector('.quickbar__input');
    input.value = '';
    input.focus();
  }
});
