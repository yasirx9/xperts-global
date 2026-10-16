/*!
 * Xperts Global — Pixel mosaic helper (xg-pixels.js)
 * Usage:
 *   <div class="xg-pixels xg-pixels--a" style="top:40px;left:-20px" aria-hidden="true"></div>
 *   Optional: data-seed="7" (same seed = same pattern), data-cols / data-rows.
 *   Auto-initialises every .xg-pixels on the page; call window.xgPixels(el, seed) for dynamic ones.
 */
(function () {
  "use strict";

  var PALETTE = ["#E34234", "#E34234", "#E34234", "#C9372A", "#C9372A", "#383838", "#141414", "#F3B1AA"];
  var VARIANT_SEEDS = { a: 11, b: 29, c: 47 };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // small deterministic PRNG so a given seed always gives the same cluster
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function variantSeed(el) {
    for (var k in VARIANT_SEEDS) {
      if (el.classList.contains("xg-pixels--" + k)) return VARIANT_SEEDS[k];
    }
    return 3;
  }

  function xgPixels(el, seed) {
    if (!el || el.__xgPixels) return el;
    el.__xgPixels = true;
    el.setAttribute("aria-hidden", "true");

    // optional fixed shape, e.g. data-pattern="1001|1001|1111|0001" (1 = square)
    var pattern = (el.getAttribute("data-pattern") || "").split("|").filter(Boolean);
    var cols = pattern.length ? pattern[0].length : (parseInt(el.getAttribute("data-cols"), 10) || 6);
    var rows = pattern.length ? pattern.length : (parseInt(el.getAttribute("data-rows"), 10) || 4);
    if (seed == null) seed = parseInt(el.getAttribute("data-seed"), 10);
    if (isNaN(seed)) seed = variantSeed(el);
    var rnd = mulberry32(seed);

    el.style.gridTemplateColumns = "repeat(" + cols + ", var(--xg-px))";
    el.style.gridTemplateRows = "repeat(" + rows + ", var(--xg-px))";

    // organic cluster: higher fill chance near a random "centre", lower at the edges
    var cx = 1 + rnd() * (cols - 2), cy = 0.5 + rnd() * (rows - 1);
    var maxD = Math.sqrt(cols * cols + rows * rows) / 2;
    var frag = document.createDocumentFragment();
    var filled = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = document.createElement("i");
        var d = Math.sqrt((c - cx) * (c - cx) + (r - cy) * (r - cy)) / maxD; // 0..~1
        var chance = 0.85 - d * 0.75;
        var on = pattern.length ? pattern[r].charAt(c) === "1" : rnd() < chance;
        if (on) {
          i.style.setProperty("--c", PALETTE[Math.floor(rnd() * PALETTE.length)]);
          i.style.setProperty("--t", (4 + rnd() * 5).toFixed(2) + "s");   // twinkle length
          i.style.setProperty("--td", (rnd() * 4).toFixed(2) + "s");      // twinkle offset
          filled.push(i);
        } else {
          i.className = "is-empty";
        }
        frag.appendChild(i);
      }
    }
    // guarantee a minimum density
    if (!pattern.length && filled.length < 6) {
      var all = frag.childNodes;
      for (var j = 0; j < all.length && filled.length < 6; j++) {
        if (all[j].className === "is-empty") {
          all[j].className = "";
          all[j].style.setProperty("--c", PALETTE[j % PALETTE.length]);
          filled.push(all[j]);
        }
      }
    }
    // stagger order is shuffled so squares pop in "one by one" randomly
    filled
      .map(function (n) { return { n: n, k: rnd() }; })
      .sort(function (a, b) { return a.k - b.k; })
      .forEach(function (o, idx) { o.n.style.setProperty("--d", idx * 45 + "ms"); });

    el.innerHTML = "";
    el.appendChild(frag);

    if (reduceMotion || !("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return el;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          // begin twinkling once the entrance has finished
          setTimeout(function () { el.classList.add("is-twinkling"); }, filled.length * 45 + 600);
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(el);
    return el;
  }

  function initAll() {
    var els = document.querySelectorAll(".xg-pixels");
    for (var i = 0; i < els.length; i++) xgPixels(els[i]);
  }

  window.xgPixels = xgPixels;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll);
  else initAll();
})();
