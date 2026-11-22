/*
 * Мини-игра «Морские огурцы».
 * Курсором мы ведём водолаза, за ним тянется хвост из собранных огурцов.
 * Столкновение с островом рассыпает всю цепочку, 8 огурцов — приз.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var GOAL = 12;
  var $ = function (selector) { return document.querySelector(selector); };
  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  var svg = $(".map__canvas");
  var map = $("#map");
  var layer = $("#gameLayer");
  var targetsGroup = $("#gameTargets");
  var chainGroup = $("#gameChain");
  var headGroup = $("#gameHead");
  var fxGroup = $("#gameFx");
  var hud = $("#gameHud");
  var scoreEl = $("#gameScore");
  var messageEl = $("#gameMessage");
  var againBtn = $("#gameAgain");
  var stopBtn = $("#gameStop");
  var button = $("#gameButton");
  var hint = $("#mapHint");
  var finale = $("#gameFinale");

  if (!svg || !map || !layer || !button) return;

  var islands = $$(".map__islands path", svg);

  var state = "idle"; /* idle | playing | over | won */
  var collected = 0;
  var target = { x: 0, y: 0 };
  var head = { x: 0, y: 0 };
  var chain = [];
  var targets = [];
  var headEl = null;
  var timer = 0;

  function make(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, String(attrs[key]));
    });
    return node;
  }

  function pointInIsland(x, y) {
    var pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    for (var i = 0; i < islands.length; i += 1) {
      if (islands[i].isPointInFill(pt)) return true;
    }
    return false;
  }

  /* Для старта и появления огурцов остров должен быть не рядом, а подальше */
  function nearIsland(x, y, margin) {
    var m = margin || 45;
    var offsets = [[0, 0], [m, 0], [-m, 0], [0, m], [0, -m],
      [m * 0.7, m * 0.7], [-m * 0.7, -m * 0.7]];
    for (var i = 0; i < offsets.length; i += 1) {
      if (pointInIsland(x + offsets[i][0], y + offsets[i][1])) return true;
    }
    return false;
  }

  /* Огурец должен быть достижим по прямой — иначе игрок врезается не по своей вине */
  function clearPath(from, to) {
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / 25));
    for (var i = 1; i <= steps; i += 1) {
      if (nearIsland(from.x + dx * i / steps, from.y + dy * i / steps, 22)) return false;
    }
    return true;
  }

  function toSvg(clientX, clientY) {
    var pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    var ctm = svg.getScreenCTM();
    return ctm ? pt.matrixTransform(ctm.inverse()) : pt;
  }

  /* Видимая часть карты в координатах SVG (карта во много раз выше экрана) */
  function visibleBox() {
    var rect = map.getBoundingClientRect();
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    var top = Math.max(rect.top, 0);
    var bottom = Math.min(rect.bottom, viewport);
    if (bottom - top < 150) bottom = Math.min(rect.bottom, rect.top + viewport);
    var tl = toSvg(rect.left, top);
    var br = toSvg(rect.right, bottom);
    return { minX: tl.x, maxX: br.x, minY: tl.y, maxY: br.y };
  }

  function freeSpot(box, avoid, from) {
    var width = Math.max(120, box.maxX - box.minX - 140);
    var height = Math.max(120, box.maxY - box.minY - 140);
    var origins = Array.isArray(from) ? from : (from ? [from] : []);

    function suitable(x, y, checkAvoid) {
      if (nearIsland(x, y, 45)) return false;
      var blocked = origins.some(function (origin) {
        return !clearPath(origin, { x: x, y: y });
      });
      if (blocked) return false;
      if (!checkAvoid) return true;
      return !(avoid || []).some(function (item) {
        return Math.abs(item.x - x) < 110 && Math.abs(item.y - y) < 90;
      });
    }

    /* Сначала ищем место подальше от других огурцов, потом — просто безопасное */
    for (var pass = 0; pass < 2; pass += 1) {
      for (var tries = 0; tries < 120; tries += 1) {
        var x = box.minX + 70 + Math.random() * width;
        var y = box.minY + 70 + Math.random() * height;
        if (suitable(x, y, pass === 0)) return { x: x, y: y };
      }
    }
    return null;
  }

  function addTarget(spot) {
    var group = make("g", {
      "class": "game-cucumber",
      transform: "translate(" + spot.x.toFixed(1) + " " + spot.y.toFixed(1) + ")"
    });
    group.appendChild(make("use", {
      href: "#game-cucumber", x: -32, y: -20, width: 64, height: 40
    }));
    targetsGroup.appendChild(group);
    targets.push({ x: spot.x, y: spot.y, el: group });
  }

  /* Границы всей карты в координатах SVG */
  function mapBox() {
    var vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width && vb.height) {
      return { minX: vb.x, maxX: vb.x + vb.width, minY: vb.y, maxY: vb.y + vb.height };
    }
    return { minX: 0, maxX: 1000, minY: 0, maxY: 3600 };
  }

  /* Все огурцы сразу разбросаны по разным местам карты — не по одному на экране */
  function scatterAcrossMap() {
    var box = mapBox();
    var margin = 70;
    var usableW = Math.max(120, box.maxX - box.minX - margin * 2);
    var usableH = Math.max(120, box.maxY - box.minY - margin * 2);
    var bandH = usableH / GOAL;
    /* Не ставим огурцы прямо на подписи мест */
    var pinSpots = $$(".pin", map).map(function (el) {
      var b = el.getBoundingClientRect();
      return toSvg(b.left + b.width / 2, b.top + b.height / 2);
    });

    function isFree(x, y) {
      if (nearIsland(x, y, 45)) return false;
      if (pinSpots.some(function (pin) {
        return Math.abs(pin.x - x) < 130 && Math.abs(pin.y - y) < 90;
      })) return false;
      return !targets.concat([head]).some(function (item) {
        return Math.abs(item.x - x) < 150 && Math.abs(item.y - y) < 120;
      });
    }

    for (var i = 0; i < GOAL; i += 1) {
      var bandTop = box.minY + margin + i * bandH;
      var spot = null;
      var tries;

      /* Сначала кладём в свою полосу, чтобы огурцы точно были по всей высоте карты */
      for (tries = 0; tries < 100 && !spot; tries += 1) {
        var x = box.minX + margin + Math.random() * usableW;
        var y = bandTop + Math.random() * bandH;
        if (isFree(x, y)) spot = { x: x, y: y };
      }
      /* Если полоса вся занята островами — ищем место в любой части карты */
      for (tries = 0; tries < 200 && !spot; tries += 1) {
        var x2 = box.minX + margin + Math.random() * usableW;
        var y2 = box.minY + margin + Math.random() * usableH;
        if (isFree(x2, y2)) spot = { x: x2, y: y2 };
      }
      if (!spot) spot = { x: box.minX + usableW / 2, y: bandTop + bandH / 2 };
      addTarget(spot);
    }
  }

  function addLink(spot) {
    var group = make("g", {
      "class": "game-chain",
      transform: "translate(" + spot.x.toFixed(1) + " " + spot.y.toFixed(1) + ")"
    });
    group.appendChild(make("use", {
      href: "#game-cucumber", x: -24, y: -15, width: 48, height: 30
    }));
    chainGroup.appendChild(group);
    chain.push({ x: spot.x, y: spot.y, el: group });
  }

  function sparkle(x, y, count, color) {
    for (var i = 0; i < count; i += 1) {
      var angle = Math.random() * Math.PI * 2;
      var distance = 24 + Math.random() * 45;
      var dot = make("circle", {
        "class": "game-spark",
        cx: 0, cy: 0, r: 2 + Math.random() * 2,
        fill: color || "#fffdfb"
      });
      dot.style.setProperty("--x", x.toFixed(1) + "px");
      dot.style.setProperty("--y", y.toFixed(1) + "px");
      dot.style.setProperty("--dx", (Math.cos(angle) * distance).toFixed(1) + "px");
      dot.style.setProperty("--dy", (Math.sin(angle) * distance).toFixed(1) + "px");
      fxGroup.appendChild(dot);
      (function (node) {
        window.setTimeout(function () { node.remove(); }, 1000);
      })(dot);
    }
  }

  function setMessage(text) {
    messageEl.textContent = text || "";
  }

  function updateScore() {
    scoreEl.textContent = "Огурцы: " + collected + " / " + GOAL;
  }

  function updateHead() {
    var flip = target.x < head.x - 6 ? -1 : 1;
    headEl.setAttribute("transform",
      "translate(" + head.x.toFixed(1) + " " + head.y.toFixed(1) + ") scale(" + flip + ",1)");
  }

  function tick() {
    if (state !== "playing") return;

    head.x += (target.x - head.x) * 0.13;
    head.y += (target.y - head.y) * 0.13;

    var px = head.x;
    var py = head.y;
    for (var i = 0; i < chain.length; i += 1) {
      var link = chain[i];
      link.x += (px - link.x) * 0.24;
      link.y += (py - link.y) * 0.24;
      link.el.setAttribute("transform",
        "translate(" + link.x.toFixed(1) + " " + link.y.toFixed(1) + ")");
      px = link.x;
      py = link.y;
    }
    updateHead();

    if (pointInIsland(head.x, head.y)) {
      crash();
      return;
    }

    for (var t = targets.length - 1; t >= 0; t -= 1) {
      var spot = targets[t];
      var dx = spot.x - head.x;
      var dy = spot.y - head.y;
      if (dx * dx + dy * dy < 42 * 42) {
        spot.el.remove();
        targets.splice(t, 1);
        addLink(chain.length ? chain[chain.length - 1] : head);
        sparkle(spot.x, spot.y, 5, "#fffdfb");
        collected += 1;
        updateScore();
        if (collected >= GOAL) {
          win();
          return;
        }
      }
    }
  }

  function scatter() {
    var pieces = chain.map(function (link) { return { x: link.x, y: link.y }; })
      .concat(targets.map(function (spot) { return { x: spot.x, y: spot.y }; }));
    pieces.forEach(function (piece) {
      var angle = Math.random() * Math.PI * 2;
      var distance = 90 + Math.random() * 150;
      var node = make("g", { "class": "game-scatter" });
      node.appendChild(make("use", {
        href: "#game-cucumber", x: -24, y: -15, width: 48, height: 30
      }));
      node.style.setProperty("--x", piece.x.toFixed(1) + "px");
      node.style.setProperty("--y", piece.y.toFixed(1) + "px");
      node.style.setProperty("--dx", (Math.cos(angle) * distance).toFixed(1) + "px");
      node.style.setProperty("--dy", (Math.sin(angle) * distance).toFixed(1) + "px");
      node.style.setProperty("--rot", Math.round(Math.random() * 720 - 360) + "deg");
      fxGroup.appendChild(node);
      (function (part) { window.setTimeout(function () { part.remove(); }, 1000); })(node);
    });
    chain.forEach(function (link) { link.el.remove(); });
    targets.forEach(function (spot) { spot.el.remove(); });
    chain = [];
    targets = [];
  }

  function crash() {
    state = "over";
    window.clearInterval(timer);
    scatter();
    headEl.setAttribute("opacity", "0");
    setMessage("Ой! Врезался в остров — огурцы рассыпались");
    againBtn.hidden = false;
    head.x = target.x;
  }

  function win() {
    state = "won";
    window.clearInterval(timer);
    targets.forEach(function (spot) { spot.el.remove(); });
    targets = [];

    /* Обычный водолаз-курсор уходит — его сменяет большой приз снизу экрана */
    if (headEl) headEl.remove();
    headEl = null;
    if (finale) finale.removeAttribute("hidden");
    hud.classList.add("game-hud--finale");

    var box = visibleBox();
    var spot = { x: box.minX + (box.maxX - box.minX) / 2, y: box.minY + (box.maxY - box.minY) * 0.7 };
    sparkle(spot.x, spot.y, 22, "#edbd55");
    sparkle(spot.x, spot.y, 14, "#fffdfb");
    setMessage("Ура! Водолаз с шампанским и гребешком — твоя награда");
    againBtn.hidden = false;
  }

  function clearGame() {
    window.clearInterval(timer);
    chain = [];
    targets = [];
    [targetsGroup, chainGroup, headGroup, fxGroup].forEach(function (group) {
      while (group.firstChild) group.removeChild(group.firstChild);
    });
    headEl = null;
  }

  function stop() {
    state = "idle";
    clearGame();
    map.classList.remove("map--game");
    button.classList.remove("is-active");
    layer.setAttribute("hidden", "");
    if (finale) finale.setAttribute("hidden", "");
    hud.classList.remove("game-hud--finale");
    hud.hidden = true;
    againBtn.hidden = true;
    hint.hidden = false;
    setMessage("");
  }

  function start() {
    clearGame();
    state = "playing";
    collected = 0;
    updateScore();
    setMessage("12 огурцов разбросаны по всей карте. Веди водолаза, обходи острова");
    againBtn.hidden = true;
    if (finale) finale.setAttribute("hidden", "");
    hud.classList.remove("game-hud--finale");
    hud.hidden = false;
    hint.hidden = true;
    map.classList.add("map--game");
    button.classList.add("is-active");
    layer.removeAttribute("hidden");

    var box = visibleBox();
    var spot = freeSpot(box, []) || { x: box.minX + (box.maxX - box.minX) / 2, y: box.minY + (box.maxY - box.minY) / 2 };
    head = { x: spot.x, y: spot.y };
    target = { x: spot.x, y: spot.y };

    /* Размер водолаза привязан к экрану, а не к координатам карты,
       чтобы на широком мониторе он не был больше девушки на сапе (~100 px) */
    var ctm = svg.getScreenCTM();
    var scale = ctm ? Math.abs(ctm.a) || 1 : 1;
    var divW = 96 / scale;
    var divH = divW * 0.7;
    headEl = make("g", { "class": "game-head" });
    headEl.appendChild(make("use", {
      href: "#game-diver",
      /* Центр головы в символе — примерно (77,25) из viewBox 100×70 */
      x: (-0.77 * divW).toFixed(1),
      y: (-0.357 * divH).toFixed(1),
      width: divW.toFixed(1),
      height: divH.toFixed(1)
    }));
    updateHead();
    headGroup.appendChild(headEl);

    scatterAcrossMap();
    timer = window.setInterval(tick, 16);
  }

  function movePointer(event) {
    if (state !== "playing") return;
    var point = toSvg(event.clientX, event.clientY);
    target.x = point.x;
    target.y = point.y;
  }

  button.addEventListener("click", function () {
    if (state === "playing") stop();
    else start();
  });
  stopBtn.addEventListener("click", stop);
  againBtn.addEventListener("click", start);
  map.addEventListener("pointermove", movePointer);
  map.addEventListener("pointerdown", movePointer);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && state !== "idle") stop();
  });
})();
