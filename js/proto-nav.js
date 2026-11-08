// Панель «Страницы» для показа прототипа: ссылки на все страницы, текущая отмечена.
// На сайт не переносится, поэтому строится скриптом из одного списка, а не копией в каждой странице.

const PROTO_PAGES = [
  ['index.html', 'Главная'],
  ['catalog.html', 'Каталог'],
  ['object.html', 'Объект'],
  ['compare.html', 'Сравнение'],
  ['login.html', 'Вход'],
  ['register.html', 'Регистрация'],
  ['code.html', 'Код из письма'],
  ['cabinet.html', 'Кабинет'],
  ['about.html', 'О проекте'],
  ['privacy.html', 'Политика'],
  ['consent.html', 'Согласие'],
  ['404.html', '404'],
  ['admin-login.html', 'Панель: вход'],
  ['admin-leads.html', 'Панель: заявки'],
  ['admin-lead.html', 'Панель: заявка'],
  ['admin-objects.html', 'Панель: объекты'],
  ['admin-object.html', 'Панель: объект'],
  ['admin-references.html', 'Панель: справочники'],
  ['admin-rates.html', 'Панель: курсы'],
  ['admin-users.html', 'Панель: пользователи'],
  ['admin-docs.html', 'Панель: документы'],
  ['admin-settings.html', 'Панель: настройки'],
];

function buildProtoNav() {
  const currentFile = location.pathname.split('/').pop() || 'index.html';

  const root = document.createElement('div');
  root.className = 'proto-nav';

  const toggle = document.createElement('button');
  toggle.className = 'proto-nav__toggle';
  toggle.type = 'button';
  toggle.textContent = 'Страницы';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'proto-nav-panel');

  const panel = document.createElement('nav');
  panel.className = 'proto-nav__panel';
  panel.id = 'proto-nav-panel';
  panel.setAttribute('aria-label', 'Страницы прототипа');

  for (const [file, title] of PROTO_PAGES) {
    const link = document.createElement('a');
    link.className = 'proto-nav__link';
    link.href = file;
    link.textContent = title;
    if (file === currentFile) {
      link.classList.add('proto-nav__link--current');
      link.setAttribute('aria-current', 'page');
    }
    panel.append(link);
  }

  root.append(toggle, panel);
  document.body.append(root);

  const setOpen = (open) => {
    root.classList.toggle('proto-nav--open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!root.classList.contains('proto-nav--open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) {
      setOpen(false);
    }
  });
}

buildProtoNav();

// Статичный хостинг отвечает на POST ошибкой 405, поэтому форма входа, кода и кабинета просто переводит
// на свой адрес, ничего не отправляя. Подключён после form-check.js: неверные формы он уже остановил.
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (event.defaultPrevented || form.method !== 'post' || form.getAttribute('action').startsWith('#')) {
    return;
  }
  event.preventDefault();
  location.href = form.action;
});
