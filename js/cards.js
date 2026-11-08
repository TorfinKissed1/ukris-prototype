// Карточка объекта из шаблона страницы и тестовых данных: кабинет и каталог дорисовывают ею
// объекты, которых нет в разметке. Кнопки в подвале карточки задаёт сам шаблон.

function buildProjectCard(template, item, { shortNote = false } = {}) {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.object = item.id;
  const image = card.querySelector('.project-card__image');
  image.src = item.image;
  image.alt = `${item.title}, ${item.city}`;
  const badge = card.querySelector('.project-card__badge');
  badge.textContent = item.keys === 'done' ? 'Сдан' : `Ключи: ${item.keys}`;
  badge.classList.toggle('project-card__badge--done', item.keys === 'done');
  card.querySelector('.project-card__place').textContent = objectPlace(item);
  card.querySelector('.project-card__link').textContent = item.title;
  const [developer, type] = card.querySelectorAll('.project-card__fact-value');
  developer.textContent = item.developer;
  type.textContent = item.type;
  const price = card.querySelector('.project-card__price-value');
  const note = card.querySelector('.project-card__price-note');
  if (!item.price) {
    price.textContent = PRICE_ON_REQUEST;
    price.classList.add('project-card__price-value--request');
    note.remove();
    return card;
  }
  price.textContent = item.price;
  // В кабинете пересчёт без даты курса, как в его карточках из разметки.
  note.textContent = shortNote ? item.priceNote.split(',')[0] : item.priceNote;
  return card;
}
