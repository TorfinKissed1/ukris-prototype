// Заявка принята: поверх окна или формы появляется золотая галочка и «Успешно отправлено», поля очищаются.
// Статичный хостинг заявку не примет, поэтому экран показывается сразу; на сайте он покажется после ответа сервера.

function resetLeadForm(form) {
  form.reset();
  syncPickerLabels(form);
}

function buildLeadSentNote() {
  const note = document.createElement('div');
  note.className = 'sent-note';
  note.setAttribute('role', 'status');
  note.innerHTML = '<span class="sent-note__mark"><svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg></span>'
    + '<p class="sent-note__text">Успешно отправлено</p>';
  return note;
}

function showLeadSent(form) {
  const note = buildLeadSentNote();
  const dialog = form.closest('dialog');
  form.inert = true;

  // Форма на странице остаётся с галочкой; поля очищены и видны снова после перезагрузки.
  if (!dialog) {
    form.append(note);
    resetLeadForm(form);
    return;
  }

  const modal = form.closest('.modal');
  modal.classList.add('modal--sent');
  modal.append(note);
  dialog.scrollTop = 0;
  dialog.addEventListener('close', () => {
    note.remove();
    modal.classList.remove('modal--sent');
    form.inert = false;
    resetLeadForm(form);
  }, { once: true });
}

// Подключён после form-check.js: неверную форму он уже остановил.
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (event.defaultPrevented || !form.matches('form[method="post"][action^="#"]')) {
    return;
  }
  event.preventDefault();
  showLeadSent(form);
});
