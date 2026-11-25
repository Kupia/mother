(function () {
  "use strict";

  var SITE = window.SITE || {};
  var PLACES = Array.isArray(window.PLACES) ? window.PLACES : [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEP_MS = 80; /* интервал между появлением следов */

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  if (SITE.name) document.title = "Твое большое морское путешествие — С днём рождения, " + SITE.name + "!";

  /* ---------- Рисуем маршрут по точкам ---------- */

  var points = PLACES.map(function (place, index) {
    var pos = place.pos || { x: 80 + index * 110, y: 300 };
    return { x: Number(pos.x) || 0, y: Number(pos.y) || 0 };
  });

  /* В маршрут можно добавить промежуточные точки (via), чтобы обогнуть озеро.
     Пины и расстояния по-прежнему считаются по основным точкам мест. */
  var routePoints = [];
  PLACES.forEach(function (place, index) {
    (Array.isArray(place.via) ? place.via : []).forEach(function (via) {
      routePoints.push({ x: Number(via.x) || 0, y: Number(via.y) || 0 });
    });
    routePoints.push(points[index]);
  });

  function smoothPath(list) {
    if (list.length < 2) return "";
    var d = "M " + list[0].x + " " + list[0].y;
    for (var i = 0; i < list.length - 1; i += 1) {
      var p0 = list[i - 1] || list[i];
      var p1 = list[i];
      var p2 = list[i + 1];
      var p3 = list[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) + ", " +
        c2x.toFixed(1) + " " + c2y.toFixed(1) + ", " + p2.x + " " + p2.y;
    }
    return d;
  }

  var mainPath = smoothPath(routePoints);
  var path = mainPath;

  /* Дорожка к первой точке приходит из-за верхнего края карты */
  if (points.length) {
    var first = points[0];
    var leadStart = { x: first.x + 90, y: first.y - 520 };
    var leadD = "M " + leadStart.x + " " + leadStart.y +
      " C " + (leadStart.x - 45) + " " + (leadStart.y + 230) + ", " +
      (first.x + 50) + " " + (first.y - 200) + ", " + first.x + " " + first.y;
    path = leadD + " " + mainPath.replace(/^M [^C]*/, "");
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  var svg = $(".map__canvas");
  var footprints = $("#footprints");
  var measure = null;
  var totalLength = 0;
  var cumulative = [];
  var printedCount = 0;
  var reachedIndex = -1; // "-1" — точка за верхним краем карты, откуда приходят следы
  var walkToken = 0;
  var pendingPanel = null;

  if (svg && footprints && points.length > 1) {
    measure = document.createElementNS(SVG_NS, "path");
    measure.setAttribute("d", path);
    measure.setAttribute("fill", "none");
    measure.setAttribute("stroke", "none");
    svg.appendChild(measure);
    totalLength = measure.getTotalLength();

    /* Расстояние до каждой точки вдоль общего пути */
    var nearest = points.map(function () { return { distance: 0, best: Infinity }; });
    for (var sample = 0; sample <= totalLength; sample += 2) {
      var sampled = measure.getPointAtLength(sample);
      nearest.forEach(function (entry, index) {
        var dx = sampled.x - points[index].x;
        var dy = sampled.y - points[index].y;
        var squared = dx * dx + dy * dy;
        if (squared < entry.best) {
          entry.best = squared;
          entry.distance = sample;
        }
      });
    }
    cumulative = nearest.map(function (entry) { return entry.distance; });
  }

  function distanceAt(index) {
    return index < 0 ? 0 : (cumulative[index] || 0);
  }

  function makePrint(distance, sideSequence, delayIndex) {
    var point = measure.getPointAtLength(distance);
    var ahead = measure.getPointAtLength(Math.min(distance + 1, totalLength));
    var angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
    var radians = angle * Math.PI / 180;
    var side = sideSequence % 2 === 0 ? 1 : -1;
    var offsetX = -Math.sin(radians) * 5 * side;
    var offsetY = Math.cos(radians) * 5 * side;
    var opacity = 0.5 + 0.35 * (distance / totalLength);

    var print = document.createElementNS(SVG_NS, "use");
    print.setAttribute("href", "#foot");
    print.setAttribute("class", "footprint");
    print.setAttribute("x", "-9");
    print.setAttribute("y", "-13.5");
    print.setAttribute("width", "18");
    print.setAttribute("height", "27");
    print.setAttribute("data-d", distance.toFixed(1));
    print.setAttribute("transform",
      "translate(" + (point.x + offsetX).toFixed(1) + " " + (point.y + offsetY).toFixed(1) + ") " +
      "rotate(" + (angle + 90).toFixed(1) + ") scale(" + side + ",1)");
    print.style.setProperty("--o", opacity.toFixed(2));
    if (!reduceMotion) print.style.animationDelay = (delayIndex * STEP_MS / 1000).toFixed(2) + "s";
    return print;
  }

  function addPrints(fromIndex, toIndex) {
    if (!measure) return 0;
    var start = distanceAt(fromIndex) + 20;
    var end = distanceAt(toIndex);
    var added = 0;
    for (var distance = start; distance < end; distance += 48) {
      footprints.appendChild(makePrint(distance, printedCount + added, added));
      added += 1;
    }
    printedCount += added;
    return added;
  }

  function trimPrints(toIndex) {
    var limit = distanceAt(toIndex);
    var removed = 0;
    $$(".footprint", footprints).forEach(function (print) {
      if (parseFloat(print.getAttribute("data-d")) > limit) {
        print.remove();
        removed += 1;
      }
    });
    printedCount = Math.max(0, printedCount - removed);
  }

  function walkTo(index, placeId) {
    var token = ++walkToken;
    if (pendingPanel) {
      clearTimeout(pendingPanel);
      pendingPanel = null;
    }

    if (index < reachedIndex) {
      trimPrints(index);
      reachedIndex = index;
      openPanel(placeId);
      return;
    }
    if (index === reachedIndex) {
      openPanel(placeId);
      return;
    }

    var added = addPrints(reachedIndex, index);
    reachedIndex = index;

    if (reduceMotion || added === 0) {
      openPanel(placeId);
    } else {
      pendingPanel = setTimeout(function () {
        if (token !== walkToken) return;
        pendingPanel = null;
        openPanel(placeId);
      }, added * STEP_MS + 450);
    }
  }

  /* ---------- Точки на карте ---------- */

  var pinsWrap = $("#pins");
  var placesById = new Map();

  PLACES.forEach(function (place, index) {
    placesById.set(place.id, place);
    var pos = points[index];
    var button = document.createElement("button");
    button.className = "pin";
    button.type = "button";
    button.dataset.placeId = place.id;
    button.style.setProperty("--x", (pos.x / 10).toFixed(2) + "%");
    button.style.setProperty("--y", (pos.y / 36).toFixed(2) + "%");
    button.setAttribute("aria-label", "Открыть галерею: " + place.city + ", " + (place.country || ""));
    button.innerHTML =
      '<span class="pin__dot" aria-hidden="true"></span>' +
      '<span class="pin__label">' +
        "<b>" + escapeHtml(place.city) + "</b>" +
      "</span>";
    pinsWrap.appendChild(button);
  });

  /* ---------- Панель галереи ---------- */

  var overlay = $("#overlay");
  var panel = $("#panel");
  var panelGrid = $("#panelGrid");
  var currentGallery = [];
  var lastFocused = null;

  function photoMarkup(photo, place, index) {
    var label = photo.alt || photo.caption || "Фото " + (index + 1);
    var galleryId = "g" + index;
    currentGallery.push({ photo: photo, place: place, index: index, hue: (index * 37 + 18) % 360 });

    if (photo.thumb || photo.full) {
      return '<button class="photo" type="button" data-gallery-id="' + galleryId + '" aria-label="' + escapeHtml(label) + '">' +
        '<img src="' + escapeHtml(photo.thumb || photo.full) + '" alt="' + escapeHtml(label) + '" decoding="async">' +
        "</button>";
    }
    return '<button class="photo photo--placeholder" type="button" data-gallery-id="' + galleryId +
      '" style="--hue:' + ((index * 37 + 18) % 360) + '" aria-label="' + escapeHtml(label) + '"></button>';
  }

  function openPanel(placeId) {
    var place = placesById.get(placeId);
    if (!place || !overlay) return;

    lastFocused = document.activeElement;
    currentGallery = [];

    $("#panelCountry").textContent = place.country || "";
    $("#panelTitle").textContent = place.city;
    $("#panelSubtitle").textContent = place.title || "";
    $("#panelCaption").textContent = place.caption || "";

    /* Заставка выходит из-под заголовка и растворяется к галерее */
    var header = $("#panelHeader");
    var oldCover = header.querySelector(".panel__cover");
    if (oldCover) oldCover.remove();
    header.classList.remove("panel__header--cover");
    if (place.cover) {
      header.classList.add("panel__header--cover");
      var cover = document.createElement("img");
      cover.className = "panel__cover";
      cover.src = place.cover;
      if (place.coverPosition) cover.style.objectPosition = place.coverPosition;
      cover.alt = "";
      cover.setAttribute("aria-hidden", "true");
      header.insertBefore(cover, header.firstChild);
    }

    var photos = Array.isArray(place.photos) ? place.photos : [];
    panelGrid.innerHTML = photos.map(function (photo, index) {
      return photoMarkup(photo, place, index);
    }).join("");

    /* Панель открывается с противоположной стороны от островка */
    var islandOnRight = Number((place.pos || {}).x) > 500;
    overlay.classList.toggle("overlay--left", islandOnRight);
    overlay.classList.toggle("overlay--right", !islandOnRight);

    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    panel.scrollTop = 0;
    $("#panelClose").focus();
  }

  function closePanel() {
    if (!overlay || overlay.hidden) return;
    closeLightbox();
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  pinsWrap.addEventListener("click", function (event) {
    var pin = event.target.closest(".pin");
    if (!pin) return;
    var index = PLACES.findIndex(function (place) { return place.id === pin.dataset.placeId; });
    if (index === -1) return;
    walkTo(index, pin.dataset.placeId);
  });

  $("#panelClose").addEventListener("click", closePanel);
  $("#panelBackdrop").addEventListener("click", closePanel);

  /* ---------- Просмотр фотографии ---------- */

  var lightbox = $("#lightbox");
  var stage = $("#lightboxStage");
  var currentIndex = 0;

  function renderLightbox() {
    var item = currentGallery[currentIndex];
    if (!item) return;
    var src = item.photo.full || item.photo.thumb;
    var label = item.photo.alt || item.photo.caption || "Фотография";

    if (src) {
      stage.innerHTML = '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(label) + '">';
    } else {
      stage.innerHTML = '<div class="lightbox__placeholder" style="--hue:' + item.hue + '">' +
        "<strong>" + escapeHtml(item.place.city) + "</strong>" +
        "<span>Здесь будет твоя фотография</span></div>";
    }
  }

  function openLightbox(galleryId) {
    var index = currentGallery.findIndex(function (item) { return "g" + item.index === galleryId; });
    if (index === -1 || !lightbox) return;
    currentIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    $("#lightboxClose").focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
  }

  function stepLightbox(direction) {
    if (!currentGallery.length) return;
    currentIndex = (currentIndex + direction + currentGallery.length) % currentGallery.length;
    renderLightbox();
  }

  document.addEventListener("click", function (event) {
    var photo = event.target.closest("[data-gallery-id]");
    if (photo) {
      openLightbox(photo.dataset.galleryId);
      return;
    }
    if (event.target.closest("#lightboxClose")) closeLightbox();
    else if (event.target.closest("#lightboxPrev")) stepLightbox(-1);
    else if (event.target.closest("#lightboxNext")) stepLightbox(1);
    else if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.hidden) {
      if (event.key === "Escape") closeLightbox();
      else if (event.key === "ArrowLeft") stepLightbox(-1);
      else if (event.key === "ArrowRight") stepLightbox(1);
    } else if (event.key === "Escape") {
      closePanel();
    }
  });

  /* ---------- Волна с крабиками ---------- */

  var waveButton = $("#greetWave");
  var waveLayer = $("#waveLayer");
  var crabLayer = $("#crabLayer");
  var waveTimer = null;

  function spawnCrabs() {
    var count = 14;
    for (var i = 0; i < count; i += 1) {
      var crab = document.createElement("i");
      crab.className = "crab";

      var startX = window.innerWidth * (0.14 + Math.random() * 0.72);
      var side = startX < window.innerWidth / 2 ? -1 : 1;
      var distance = 120 + Math.random() * 260;

      /* Появляются по мере отступления воды: сначала выше, потом ниже */
      var delay = 0.95 + Math.random() * 0.85;
      var retreat = (delay - 0.95) / 0.85;
      crab.style.left = startX.toFixed(0) + "px";
      crab.style.top = (window.innerHeight * (0.68 + retreat * 0.28)).toFixed(0) + "px";
      crab.style.setProperty("--dx", (side * distance).toFixed(0) + "px");
      crab.style.setProperty("--dy", (Math.random() * 12).toFixed(0) + "px");
      crab.style.setProperty("--rot", (side * (12 + Math.random() * 28)).toFixed(0) + "deg");
      crab.style.setProperty("--size", (20 + Math.random() * 12).toFixed(0) + "px");
      var dur = 0.9 + Math.random() * 0.6;
      crab.style.setProperty("--dur", dur.toFixed(2) + "s");
      crab.style.setProperty("--delay", delay.toFixed(2) + "s");
      crab.innerHTML = '<span><svg viewBox="0 0 40 28" aria-hidden="true"><use href="#crab"></use></svg></span>';
      crab.addEventListener("animationend", function (event) {
        if (event.target === this && event.animationName === "crab-run") this.remove();
      });
      crabLayer.appendChild(crab);
      /* Надёжная уборка: если анимация не доиграла (фоновый таб), крабик всё равно исчезнет */
      (function (item, lifetime) {
        setTimeout(function () { item.remove(); }, lifetime);
      })(crab, (dur + delay) * 1000 + 250);
    }
  }

  function greetWithWave() {
    if (reduceMotion || !waveLayer || !crabLayer) return;
    if (waveTimer) clearTimeout(waveTimer);
    waveLayer.classList.remove("is-active");
    void waveLayer.offsetWidth; // перезапуск анимации при повторном нажатии
    waveLayer.classList.add("is-active");
    if (waveButton) waveButton.disabled = true;
    spawnCrabs();
    waveTimer = setTimeout(function () {
      waveLayer.classList.remove("is-active");
      if (waveButton) waveButton.disabled = false;
      waveTimer = null;
    }, 2100);
  }

  if (waveButton) waveButton.addEventListener("click", greetWithWave);

  /* ---------- Девушка на сапе: проплывает слева направо ---------- */

  var supButton = $("#supButton");
  var supLayer = $("#supLayer");
  var supIcon = $("#icon-sup");

  /* Копируем символ в другой SVG: так руку с веслом можно анимировать отдельно
     (внутри <use> её нельзя достать обычным CSS-селектором). */
  function supSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 80 60");
    svg.setAttribute("aria-hidden", "true");
    if (!supIcon) return svg;
    var paddle = document.createElementNS(ns, "g");
    paddle.setAttribute("class", "sup__paddle");
    Array.prototype.forEach.call(supIcon.childNodes, function (node) {
      var copy = node.cloneNode(true);
      if (copy.nodeType === 1 && copy.hasAttribute("data-sup-paddle")) paddle.appendChild(copy);
      else svg.appendChild(copy);
    });
    svg.appendChild(paddle);
    return svg;
  }

  function sendSup() {
    if (reduceMotion || !supLayer) return;
    if (supButton) supButton.disabled = true;
    var dur = 6;
    var sup = document.createElement("i");
    sup.className = "sup";
    /* Плывёт в случайной полосе экрана */
    sup.style.top = (window.innerHeight * (0.2 + Math.random() * 0.55)).toFixed(0) + "px";
    sup.style.setProperty("--size", (90 + Math.random() * 40).toFixed(0) + "px");
    sup.style.setProperty("--dur", dur.toFixed(1) + "s");
    sup.style.setProperty("--dy", (Math.random() * 30 - 15).toFixed(0) + "px");
    var supBody = document.createElement("span");
    supBody.appendChild(supSvg());
    sup.appendChild(supBody);
    sup.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.remove("sup--paddle");
      void this.offsetWidth; /* перезапуск анимации при новом клике */
      this.classList.add("sup--paddle");
    });
    sup.addEventListener("animationend", function (event) {
      if (event.animationName === "sup-paddle") {
        this.classList.remove("sup--paddle");
      } else if (event.target === this && event.animationName === "sup-sail") {
        this.remove();
        if (supButton) supButton.disabled = false;
      }
    });
    supLayer.appendChild(sup);
    /* Надёжная уборка, если анимация не доиграла */
    setTimeout(function () {
      sup.remove();
      if (supButton) supButton.disabled = false;
    }, dur * 1000 + 400);
  }

  if (supButton) supButton.addEventListener("click", sendSup);

  /* ---------- Конфетти ---------- */

  var celebrateButton = $("#celebrate");
  if (celebrateButton) {
    celebrateButton.addEventListener("click", function () {
      if (reduceMotion) return;
      var layer = $("#confetti");
      var colors = ["#e8b4b8", "#d9c3a5", "#f6e2c8", "#b9c8a7", "#c9b6d6"];
      for (var i = 0; i < 70; i += 1) {
        var piece = document.createElement("i");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = (Math.random() * 0.4).toFixed(2) + "s";
        piece.style.setProperty("--dur", (2.2 + Math.random() * 1.8).toFixed(2) + "s");
        piece.style.setProperty("--drift", Math.round(Math.random() * 140 - 70) + "px");
        piece.addEventListener("animationend", function () { this.remove(); });
        layer.appendChild(piece);
      }
    });
  }

  /* ---------- Финал: «Куда дальше?» ---------- */

  var finaleAsk = $("#finaleAsk");
  var finaleAnswer = $("#finaleAnswer");
  if (finaleAsk && finaleAnswer) {
    finaleAsk.addEventListener("click", function () {
      finaleAnswer.hidden = false;
      finaleAsk.setAttribute("aria-expanded", "true");
      var hint = $(".map__hint");
      if (hint) hint.hidden = true;
    });
  }
})();
