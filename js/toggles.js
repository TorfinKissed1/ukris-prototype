// Кнопки «В избранное» и «К сравнению»: нажатие переключает состояние кнопки на странице
// (aria-pressed, класс и подпись). Сохранение в аккаунте и счётчики в шапке появятся на этапе
// с сервером: здесь состояние живёт до перезагрузки страницы.

const FAVORITE_LABEL = { on: 'Убрать из избранного', off: 'Добавить в избранное' };

const TOGGLES = [
  { selector: '.project-card__favorite', activeClass: 'project-card__favorite--active', label: FAVORITE_LABEL },
  { selector: '.compare__tool[aria-pressed]', activeClass: 'compare__tool--active', label: FAVORITE_LABEL },
  { selector: '.summary__favorite', activeClass: 'summary__tool--active', text: { on: 'В избранном', off: 'В избранное' } },
  { selector: '.project-card__compare, .summary__compare', text: { on: 'В сравнении', off: 'К сравнению' } },
];

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

document.addEventListener('click', (event) => {
  for (const toggle of TOGGLES) {
    const button = event.target.closest(toggle.selector);
    if (!button) {
      continue;
    }
    const pressed = button.getAttribute('aria-pressed') !== 'true';
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
    return;
  }
});
