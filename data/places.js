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
        full: "assets/photos/sakhalin/9b9ee15e-53b5-46b6-aefc-881b1e6ee4ca.jpeg" }
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
      { alt: "Первое озеро" },
      { alt: "Тихий берег" },
      { alt: "Сосны у воды" },
      { alt: "Отражение в озере" }
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
      { alt: "Бухта и сопки" },
      { alt: "Набережная города" },
      { alt: "Океан вдалеке" },
      { alt: "Вечерний Владивосток" }
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
      { alt: "Лазурный берег" },
      { alt: "Море и скалы" },
      { alt: "Ужин у моря" },
      { alt: "Закат на Кипре" }
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
