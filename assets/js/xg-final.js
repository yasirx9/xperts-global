/*!
 * Xperts Global — final CTA (xg-final.js)
 * scroll-scrubbed word reveal (scale .9→1, opacity .2→1) + magnetic button (≤20px, desktop only).
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scrubbed words */
  document.querySelectorAll(".xg-final").forEach(function (sec) {
    var title = sec.querySelector(".xg-final__title");
    if (!title || reduce) return;
    // wrap each word, keeping the red highlight span
    var html = "";
    title.childNodes.forEach(function (n) {
      var hl = n.nodeType === 1 && n.classList.contains("xg-hl");
      (n.textContent || "").trim().split(/\s+/).forEach(function (w) {
        if (w) html += '<span class="xg-fw' + (hl ? " xg-hl" : "") + '">' + w + "</span> ";
      });
    });
    title.innerHTML = html.trim();
    var words = [].slice.call(title.querySelectorAll(".xg-fw"));
    var ticking = false;
    function update() {
      ticking = false;
      var r = title.getBoundingClientRect(), vh = window.innerHeight;
      // 0 when the title enters the bottom of the screen, 1 when it reaches 45% from top
      var p = (vh - r.top) / (vh * 0.55);
      p = Math.max(0, Math.min(1, p));
      words.forEach(function (w, i) {
        var start = i / (words.length + 1), span = 2 / (words.length + 1);
        var t = Math.max(0, Math.min(1, (p - start) / span));
        w.style.opacity = (0.2 + 0.8 * t).toFixed(3);
        w.style.transform = "scale(" + (0.9 + 0.1 * t).toFixed(4) + ")";
      });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* magnetic buttons */
  if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".xg-magnetic").forEach(function (wrap) {
    var MAX = 20, RANGE = 60;
    function move(e) {
      var r = wrap.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var inside = Math.abs(dx) < r.width / 2 + RANGE && Math.abs(dy) < r.height / 2 + RANGE;
      if (!inside) { reset(); return; }
      var x = Math.max(-MAX, Math.min(MAX, dx * 0.3)), y = Math.max(-MAX, Math.min(MAX, dy * 0.45));
      wrap.classList.add("is-pulling");
      wrap.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    }
    function reset() { wrap.classList.remove("is-pulling"); wrap.style.transform = ""; }
    var area = wrap.closest("section") || document;
    area.addEventListener("mousemove", move);
    area.addEventListener("mouseleave", reset);
  });
})();
