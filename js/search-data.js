// Тестовые данные поиска прототипа: собраны из карточек главной и каталога.
// На сайте подсказки-характеристики приедут со страницей, объекты по словам с сервера.
window.SEARCH_DATA = {
  "facets": [
    {
      "title": "ОАЭ",
      "kind": "Страна",
      "count": 14,
      "url": "catalog.html?country=oae"
    },
    {
      "title": "Турция",
      "kind": "Страна",
      "count": 8,
      "url": "catalog.html?country=turkey"
    },
    {
      "title": "Таиланд",
      "kind": "Страна",
      "count": 5,
      "url": "catalog.html?country=thailand"
    },
    {
      "title": "Дубай",
      "kind": "Город, ОАЭ",
      "count": 8,
      "url": "catalog.html?country=oae&city=dubai"
    },
    {
      "title": "Абу-Даби",
      "kind": "Город, ОАЭ",
      "count": 4,
      "url": "catalog.html?country=oae&city=abu-dhabi"
    },
    {
      "title": "Алания",
      "kind": "Город, Турция",
      "count": 1,
      "url": "catalog.html?country=turkey&city=alanya"
    },
    {
      "title": "Пхукет",
      "kind": "Город, Таиланд",
      "count": 1,
      "url": "catalog.html?country=thailand&city=phuket"
    },
    {
      "title": "Мерсин",
      "kind": "Город, Турция",
      "count": 1,
      "url": "catalog.html?country=turkey&city=mersin"
    },
    {
      "title": "Апартаменты",
      "kind": "Тип",
      "count": 9,
      "url": "catalog.html?type=apartments"
    },
    {
      "title": "Виллы",
      "kind": "Тип",
      "count": 3,
      "url": "catalog.html?type=villas"
    },
    {
      "title": "Квартиры",
      "kind": "Тип",
      "count": 2,
      "url": "catalog.html?type=flats"
    },
    {
      "title": "Таунхаусы",
      "kind": "Тип",
      "count": 1,
      "url": "catalog.html?type=townhouses"
    },
    {
      "title": "Crest Development",
      "kind": "Застройщик",
      "count": 3,
      "url": "catalog.html?q=Crest+Development"
    },
    {
      "title": "Sand Line Properties",
      "kind": "Застройщик",
      "count": 3,
      "url": "catalog.html?q=Sand+Line+Properties"
    },
    {
      "title": "Bayline Estates",
      "kind": "Застройщик",
      "count": 3,
      "url": "catalog.html?q=Bayline+Estates"
    },
    {
      "title": "Greenway Homes",
      "kind": "Застройщик",
      "count": 3,
      "url": "catalog.html?q=Greenway+Homes"
    },
    {
      "title": "Blue Coast Yapı",
      "kind": "Застройщик",
      "count": 1,
      "url": "catalog.html?q=Blue+Coast+Yapı"
    },
    {
      "title": "Andaman Living",
      "kind": "Застройщик",
      "count": 1,
      "url": "catalog.html?q=Andaman+Living"
    },
    {
      "title": "Mersin Kent Group",
      "kind": "Застройщик",
      "count": 1,
      "url": "catalog.html?q=Mersin+Kent+Group"
    }
  ],
  "objects": [
    {
      "title": "Marina Crest Residence",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Crest Development",
      "type": "Апартаменты",
      "price": "от 410 000 $",
      "image": "../img/dubai-pool.webp",
      "url": "object.html"
    },
    {
      "title": "Aqua Terra Villas",
      "country": "Турция",
      "city": "Алания",
      "developer": "Blue Coast Yapı",
      "type": "Виллы",
      "price": "от 640 000 €",
      "image": "../img/villa-sea.webp",
      "url": "object.html"
    },
    {
      "title": "Laguna Bay Residence",
      "country": "Таиланд",
      "city": "Пхукет",
      "developer": "Andaman Living",
      "type": "Апартаменты",
      "price": "от 6 900 000 ฿",
      "image": "../img/interior-sea.webp",
      "url": "object.html"
    },
    {
      "title": "Skyline Park",
      "country": "Турция",
      "city": "Мерсин",
      "developer": "Mersin Kent Group",
      "type": "Квартиры",
      "price": "от 145 000 $",
      "image": "../img/towers-park.webp",
      "url": "object.html"
    },
    {
      "title": "Palm Garden Villas",
      "country": "ОАЭ",
      "city": "Абу-Даби",
      "developer": "Sand Line Properties",
      "type": "Виллы",
      "price": "от 4 200 000 AED",
      "image": "../img/villa-palms.webp",
      "url": "object.html"
    },
    {
      "title": "Harbour View",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Bayline Estates",
      "type": "Апартаменты",
      "price": "Цена по запросу",
      "image": "../img/interior-dubai.webp",
      "url": "object.html"
    },
    {
      "title": "Azure Heights",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Bayline Estates",
      "type": "Апартаменты",
      "price": "от 295 000 $",
      "image": "../img/interior-city.webp",
      "url": "object.html"
    },
    {
      "title": "Saadiyat Shore",
      "country": "ОАЭ",
      "city": "Абу-Даби",
      "developer": "Sand Line Properties",
      "type": "Апартаменты",
      "price": "от 2 100 000 AED",
      "image": "../img/interior-sea.webp",
      "url": "object.html"
    },
    {
      "title": "Oasis Lane Townhouses",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Greenway Homes",
      "type": "Таунхаусы",
      "price": "от 3 600 000 AED",
      "image": "../img/villa-sea.webp",
      "url": "object.html"
    },
    {
      "title": "Creek Point Tower",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Crest Development",
      "type": "Апартаменты",
      "price": "от 1 350 000 AED",
      "image": "../img/towers-park.webp",
      "url": "object.html"
    },
    {
      "title": "Yas Bay Lofts",
      "country": "ОАЭ",
      "city": "Абу-Даби",
      "developer": "Greenway Homes",
      "type": "Апартаменты",
      "price": "от 1 050 000 AED",
      "image": "../img/dubai-pool.webp",
      "url": "object.html"
    },
    {
      "title": "Palm Vista Villas",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Crest Development",
      "type": "Виллы",
      "price": "от 2 850 000 $",
      "image": "../img/villa-palms.webp",
      "url": "object.html"
    },
    {
      "title": "Business Bay One",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Bayline Estates",
      "type": "Апартаменты",
      "price": "от 720 000 AED",
      "image": "../img/towers-park.webp",
      "url": "object.html"
    },
    {
      "title": "Reem Island Gardens",
      "country": "ОАЭ",
      "city": "Абу-Даби",
      "developer": "Sand Line Properties",
      "type": "Квартиры",
      "price": "от 1 600 000 AED",
      "image": "../img/interior-sea.webp",
      "url": "object.html"
    },
    {
      "title": "Jumeirah Park Residences",
      "country": "ОАЭ",
      "city": "Дубай",
      "developer": "Greenway Homes",
      "type": "Апартаменты",
      "price": "от 540 000 $",
      "image": "../img/interior-dubai.webp",
      "url": "object.html"
    }
  ]
};
