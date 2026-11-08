// Избранное и сравнение в кабинете на тестовых данных: списки строятся по saved.js. Карточки
// из разметки переиспользуются, остальные собираются из шаблонов (js/cards.js) и js/mock-data.js.

const CABINET_FADE = 200;
const cabinetObjects = new Map(window.MOCK_DATA.objects.map((item) => [item.id, item]));
const cabinetMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function buildFavoriteCard(template, item) {
  const card = buildProjectCard(template, item, { shortNote: true });
  card.querySelector('.cabinet__remove').setAttribute('aria-label', `Убрать из избранного: ${item.title}`);
  return card;
}

function buildSavedItem(template, item) {
  const row = template.content.firstElementChild.cloneNode(true);
  row.querySelector('.saved__image').src = item.image;
  row.querySelector('.saved__place').textContent = `${item.country}, ${item.city}`;
  row.querySelector('.saved__name').textContent = item.title;
  return row;
}

const cabinetLists = [
  { list: 'favorites', section: document.getElementById('izbrannoe'), container: '.projects', template: 'favorite-card', build: buildFavoriteCard },
  { list: 'compare', section: document.getElementById('sravnenie'), container: '.saved', template: 'saved-item', build: buildSavedItem },
].map((config) => {
  const container = config.section.querySelector(config.container);
  const items = new Map([...container.children].map((item) => [item.dataset.object, item]));
  return { ...config, container, items, empty: config.section.querySelector('.empty'), template: document.getElementById(config.template) };
});

function cabinetFade(element, keyframes) {
  if (cabinetMotion.matches) {
    return Promise.resolve();
  }
  return element.animate(keyframes, { duration: CABINET_FADE }).finished;
}

function renderCabinetList(config) {
  const ids = window.ProtoSaved.ids(config.list).filter((id) => cabinetObjects.has(id));
  const nodes = ids.map((id) => {
    if (!config.items.has(id)) {
      const node = config.build(config.template, cabinetObjects.get(id));
      node.dataset.object = id;
      config.items.set(id, node);
    }
    return config.items.get(id);
  });
  config.container.replaceChildren(...nodes);
  config.container.hidden = !ids.length;
  // У пустого списка та же ссылка стоит кнопкой ниже.
  config.section.querySelector('.cabinet__more').hidden = !ids.length;
  const emptyWasHidden = config.empty.hidden;
  config.empty.hidden = Boolean(ids.length);
  if (emptyWasHidden && !config.empty.hidden) {
    cabinetFade(config.empty, [{ opacity: 0 }, { opacity: 1 }]);
  }
  document.dispatchEvent(new CustomEvent('saved:render'));
}

// Убранная карточка сначала гаснет, потом список перестраивается.
function updateCabinetList(config) {
  const ids = window.ProtoSaved.ids(config.list);
  const leaving = [...config.container.children].filter((node) => !ids.includes(node.dataset.object));
  const fades = leaving.map((node) => cabinetFade(node, [{ opacity: 1 }, { opacity: 0 }]).then(() => {
    node.style.opacity = '0';
  }));
  Promise.all(fades).then(() => {
    leaving.forEach((node) => node.style.removeProperty('opacity'));
    renderCabinetList(config);
  });
}

document.addEventListener('click', (event) => {
  const remove = event.target.closest('.cabinet__remove');
  if (remove) {
    window.ProtoSaved.remove('favorites', remove.closest('[data-object]').dataset.object);
  }
});

document.addEventListener('saved:change', (event) => {
  const config = cabinetLists.find((item) => item.list === event.detail.list);
  updateCabinetList(config);
});

cabinetLists.forEach(renderCabinetList);
