/*
 * Настройки сайта и точки маршрута.
 *
 * Тема пути — моря, озёра и побережья. Порядок массива задаёт
 * порядок следования точек: новые места просто дописываются в конец.
 *
 * pos — положение точки на карте в координатах SVG 1000 × 3600.
 * Маршрут идёт сверху вниз, страница прокручивается.
 *
 * У фотографий пока нет полей thumb/full, поэтому в галерее показываются
 * цветные заглушки. Чтобы подключить настоящее фото, добавь:
 *   thumb: "assets/photos/sakhalin/01-thumb.webp",
 *   full:  "assets/photos/sakhalin/01.webp"
 * и положи файлы в папку assets/photos/<id-места>/. См. README.md.
 */

window.SITE = {
  name: "Татьяна",
  date: "26.11",
  greeting: "Пусть в каждом море останется по одному хорошему воспоминанию, а впереди будет ещё множество новых."
};

window.PLACES = [
  {
    id: "sakhalin",
    city: "Сахалин",
    country: "Россия",
    pos: { x: 337, y: 320 },
    title: "Тихий берег",
    cover: "assets/photos/sakhalin/cover.jpg",
    caption: "Остров, где море можно было наблюдать с первых дней, где тебе снились подводные сны в стиле Миядзаки и куда вы отправляли нас на лето, а на зиму мы туда рвёмся кататься на лыжах до сих пор",
    photos: [
      { alt: "Берег и скалы",
        thumb: "assets/photos/sakhalin/0d8c7f95-05df-4414-ad1a-a8ad4b0e6ea7-thumb.jpeg",
        full: "assets/photos/sakhalin/0d8c7f95-05df-4414-ad1a-a8ad4b0e6ea7.jpeg" },
      { alt: "Море утром",
        thumb: "assets/photos/sakhalin/3ba63a43-a4e5-4e3f-ae05-67a831f3ebb2-thumb.jpeg",
        full: "assets/photos/sakhalin/3ba63a43-a4e5-4e3f-ae05-67a831f3ebb2.jpeg" },
      { alt: "Прогулка у воды",
        thumb: "assets/photos/sakhalin/4a490854-91c0-47e9-acae-a9b17a4beabb-thumb.jpeg",
        full: "assets/photos/sakhalin/4a490854-91c0-47e9-acae-a9b17a4beabb.jpeg" },
      { alt: "Ужин на берегу",
        thumb: "assets/photos/sakhalin/7e155714-6aed-4272-95cd-8b1a45b3aaab-thumb.jpeg",
        full: "assets/photos/sakhalin/7e155714-6aed-4272-95cd-8b1a45b3aaab.jpeg" },
      { alt: "Ещё одно фото",
        thumb: "assets/photos/sakhalin/9b9ee15e-53b5-46b6-aefc-881b1e6ee4ca-thumb.jpeg",
        full: "assets/photos/sakhalin/9b9ee15e-53b5-46b6-aefc-881b1e6ee4ca.jpeg" },
      { alt: "Ещё одно фото с острова",
        thumb: "assets/photos/sakhalin/43428357-74ec-4154-bad3-af6e536bdd7a-thumb.jpeg",
        full: "assets/photos/sakhalin/43428357-74ec-4154-bad3-af6e536bdd7a.jpeg" }
    ]
  },
  {
    id: "minsk-sea",
    city: "Минское море",
    country: "Беларусь",
    pos: { x: 740, y: 920 },
    title: "Море рядом с домом",
    cover: "assets/photos/minsk-sea/cover.jpeg",
    caption: "Это остановка не совсем про море, но про путь объединения двух морей: Тебя в виде тихого океана и Папы в виде шумного, любящего, но домашнего Минского моря. Минск стал для вас и для нас местом, в котором мы все провели не одно лето, наравне с Сахалином",
    photos: [
      { alt: "Фото из Минского моря 1",
        thumb: "assets/photos/minsk-sea/06223b41-7297-4770-9968-d36b9b38f4ec-thumb.jpeg",
        full: "assets/photos/minsk-sea/06223b41-7297-4770-9968-d36b9b38f4ec.jpeg" },
      { alt: "Фото из Минского моря 2",
        thumb: "assets/photos/minsk-sea/33562e7d-4a7a-4754-b197-f4dc22eedd2a-thumb.jpeg",
        full: "assets/photos/minsk-sea/33562e7d-4a7a-4754-b197-f4dc22eedd2a.jpeg" },
      { alt: "Фото из Минского моря 3",
        thumb: "assets/photos/minsk-sea/4c16b573-59f3-45dc-a18e-1be79b76ac96-thumb.jpeg",
        full: "assets/photos/minsk-sea/4c16b573-59f3-45dc-a18e-1be79b76ac96.jpeg" },
      { alt: "Фото из Минского моря 4",
        thumb: "assets/photos/minsk-sea/cd7c6fcd-6399-4730-bbe4-d85fdfe1837e-thumb.jpeg",
        full: "assets/photos/minsk-sea/cd7c6fcd-6399-4730-bbe4-d85fdfe1837e.jpeg" }
    ]
  },
  {
    id: "treozerye",
    city: "Триозерье",
    country: "Россия",
    pos: { x: 300, y: 1510 },
    via: [
      { x: 420, y: 1310 }, { x: 330, y: 1320 }, { x: 210, y: 1320 },
      { x: 175, y: 1385 }, { x: 250, y: 1445 }
    ],
    title: "Три озера",
    caption: "Тихая вода, сосны и чувство, что время здесь течёт иначе.",
    photos: [
      { alt: "Фото из Триозерья 1",
        thumb: "assets/photos/treozerye/29ed44e9-3a11-453e-9c72-b013057b9d21-thumb.jpeg",
        full: "assets/photos/treozerye/29ed44e9-3a11-453e-9c72-b013057b9d21.jpeg" },
      { alt: "Фото из Триозерья 2",
        thumb: "assets/photos/treozerye/6b525b9a-513a-46e5-8503-2dbab51c1657-thumb.jpeg",
        full: "assets/photos/treozerye/6b525b9a-513a-46e5-8503-2dbab51c1657.jpeg" },
      { alt: "Фото из Триозерья 3",
        thumb: "assets/photos/treozerye/8eafbdb2-5c02-478f-9fba-bfdc5b2bb995-thumb.jpeg",
        full: "assets/photos/treozerye/8eafbdb2-5c02-478f-9fba-bfdc5b2bb995.jpeg" },
      { alt: "Фото из Триозерья 4",
        thumb: "assets/photos/treozerye/913d285b-3b30-4e19-95a7-41fe3af3d196-thumb.jpeg",
        full: "assets/photos/treozerye/913d285b-3b30-4e19-95a7-41fe3af3d196.jpeg" },
      { alt: "Фото из Триозерья 5",
        thumb: "assets/photos/treozerye/cded9c12-d337-4691-abfa-de5d953c1237-thumb.jpeg",
        full: "assets/photos/treozerye/cded9c12-d337-4691-abfa-de5d953c1237.jpeg" }
    ]
  },
  {
    id: "vladivostok",
    city: "Владивосток",
    country: "Россия",
    pos: { x: 645, y: 2040 },
    title: "Где начинается океан",
    caption: "Сопки, бухты и долгие прогулки у воды.",
    photos: [
      { alt: "Фото из Владивостока 1",
        thumb: "assets/photos/vladivostok/01965a70-3cbd-4e54-9592-88ccb9aafafa-thumb.jpeg",
        full: "assets/photos/vladivostok/01965a70-3cbd-4e54-9592-88ccb9aafafa.jpeg" },
      { alt: "Фото из Владивостока 2",
        thumb: "assets/photos/vladivostok/a9dedb86-4e8c-4c12-8aef-beb824641503-thumb.jpeg",
        full: "assets/photos/vladivostok/a9dedb86-4e8c-4c12-8aef-beb824641503.jpeg" },
      { alt: "Фото из Владивостока 3",
        thumb: "assets/photos/vladivostok/be951a4c-2956-4ba7-8885-33ab1445bf73-thumb.jpeg",
        full: "assets/photos/vladivostok/be951a4c-2956-4ba7-8885-33ab1445bf73.jpeg" },
      { alt: "Владивосток в 2018 году",
        thumb: "assets/photos/vladivostok/2018-08-18%2009-20-33_1546337000144-thumb.JPG",
        full: "assets/photos/vladivostok/2018-08-18%2009-20-33_1546337000144.JPG" },
      { alt: "Владивосток в 2021 году",
        thumb: "assets/photos/vladivostok/2021-03-07%2014-47-12-thumb.JPG",
        full: "assets/photos/vladivostok/2021-03-07%2014-47-12.JPG" }
    ]
  },
  {
    id: "cyprus",
    city: "Кипр",
    country: "Кипр",
    pos: { x: 300, y: 2710 },
    via: [{ x: 460, y: 2600 }],
    title: "Самое тёплое море",
    caption: "Солнце, лазурь и разговоры, которые хочется продлить.",
    photos: [
      { alt: "Фото с Кипра 1",
        thumb: "assets/photos/cyprus/065f53b0-d241-4287-a9ed-94c5b85edf7d-thumb.jpeg",
        full: "assets/photos/cyprus/065f53b0-d241-4287-a9ed-94c5b85edf7d.jpeg" },
      { alt: "Фото с Кипра 2",
        thumb: "assets/photos/cyprus/097a930c-b239-46f8-af81-b861dbe59119-thumb.jpeg",
        full: "assets/photos/cyprus/097a930c-b239-46f8-af81-b861dbe59119.jpeg" },
      { alt: "Фото с Кипра 3",
        thumb: "assets/photos/cyprus/195b00fe-612a-4265-a07c-934dfed2d346-thumb.jpeg",
        full: "assets/photos/cyprus/195b00fe-612a-4265-a07c-934dfed2d346.jpeg" },
      { alt: "Фото с Кипра 4",
        thumb: "assets/photos/cyprus/2e7b868e-c21f-44a0-a5a8-2ef89c6860f4-thumb.jpeg",
        full: "assets/photos/cyprus/2e7b868e-c21f-44a0-a5a8-2ef89c6860f4.jpeg" },
      { alt: "Фото с Кипра 5",
        thumb: "assets/photos/cyprus/581be3b2-f662-43da-ab6d-d5b0a0613a12-thumb.jpeg",
        full: "assets/photos/cyprus/581be3b2-f662-43da-ab6d-d5b0a0613a12.jpeg" }
    ]
  },
  {
    id: "thailand",
    city: "Пхукет",
    country: "Таиланд",
    pos: { x: 670, y: 3310 },
    title: "Тёплое море и пальмы",
    caption: "Последняя остановка: тёплый ветер, лазурь и ощущение, что впереди ещё много всего.",
    photos: [
      { alt: "Пальмы и пляж" },
      { alt: "Тёплое море" },
      { alt: "Ужин на берегу" },
      { alt: "Закат на Пхукете" }
    ]
  }
];
