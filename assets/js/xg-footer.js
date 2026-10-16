/*!
 * Xperts Global — footer (xg-footer.js): back-to-top with scroll-progress ring.
 * (column stagger uses data-xg-reveal from xg-values.js when present, or its own fallback here)
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var btn = document.querySelector(".xg-totop");
  if (btn) {
    var fg = btn.querySelector(".fg");
    var C = fg ? 2 * Math.PI * parseFloat(fg.getAttribute("r")) : 0;
    if (fg) { fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C; }
    var tick = false;
    var upd = function () {
      tick = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.pageYOffset / max) : 0;
      if (fg) fg.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
    btn.addEventListener("click", function () {
      if (window.xgLenis) window.xgLenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      var first = document.querySelector("#xg-header a, a, button"); if (first) first.focus({ preventScroll: true });
    });
  }
  // stagger fallback for pages that don't load xg-values.js
  if (!document.querySelector('script[src*="xg-values.js"]')) {
    document.querySelectorAll(".xg-footer [data-xg-reveal]").forEach(function (box) {
      box.querySelectorAll(".xg-reveal-item").forEach(function (el, i) { el.style.setProperty("--i", i); });
      if (reduce || !("IntersectionObserver" in window)) { box.classList.add("is-in"); return; }
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { box.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.15 });
      io.observe(box);
    });
  }
})();
