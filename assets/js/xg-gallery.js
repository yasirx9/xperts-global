/* Xperts Global · product screen gallery: auto-advances every data-interval ms (default 10s),
   pauses on hover/focus and when off-screen, keyboard + thumbnails, respects reduced motion. */
(function () {
  "use strict";
  document.querySelectorAll(".xg-gal").forEach(function (gal) {
    var slides = [].slice.call(gal.querySelectorAll(".xg-gal__slide"));
    var thumbs = [].slice.call(gal.querySelectorAll(".xg-gal__thumb"));
    var count = gal.querySelector(".xg-gal__count"), text = gal.querySelector(".xg-gal__text");
    var bar = gal.querySelector(".xg-gal__progress i"), pauseBtn = gal.querySelector(".xg-gal__pause");
    var interval = parseInt(gal.getAttribute("data-interval"), 10) || 10000;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var n = slides.length, cur = 0, timer = null, start = 0, left = interval;
    var userPaused = reduce, hover = false, visible = true;
    if (!n) return;
    function pad(x) { return (x < 10 ? "0" : "") + x; }
    function show(i) {
      cur = (i + n) % n;
      slides.forEach(function (s, k) { var on = k === cur; s.classList.toggle("is-active", on); if (on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true"); });
      thumbs.forEach(function (t, k) { t.classList.toggle("is-active", k === cur); if (k === cur) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
      var img = slides[cur].querySelector("img"); if (img) img.loading = "eager";
      var nx = slides[(cur + 1) % n].querySelector("img"); if (nx) nx.loading = "eager";
      if (count) count.textContent = pad(cur + 1) + " / " + pad(n);
      if (text) text.textContent = slides[cur].getAttribute("data-caption") || "";
      var act = thumbs[cur]; if (act && act.parentNode.scrollWidth > act.parentNode.clientWidth) act.parentNode.scrollTo({ left: act.offsetLeft - act.parentNode.clientWidth / 2 + act.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
      left = interval; schedule();
    }
    function running() { return !userPaused && !hover && visible && !document.hidden; }
    function setBar(p, ms) {
      if (!bar) return;
      bar.style.transition = "none"; bar.style.transform = "scaleX(" + p + ")";
      if (ms) { void bar.offsetWidth; bar.style.transition = "transform " + ms + "ms linear"; bar.style.transform = "scaleX(1)"; }
    }
    function stop() {
      if (timer) { clearTimeout(timer); timer = null; left = Math.max(0, left - (Date.now() - start)); }
      setBar(1 - left / interval, 0);
    }
    function schedule() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (!running()) { setBar(1 - left / interval, 0); return; }
      start = Date.now(); setBar(1 - left / interval, left);
      timer = setTimeout(function () { timer = null; show(cur + 1); }, left);
    }
    gal.querySelector(".xg-gal__prev").addEventListener("click", function () { show(cur - 1); });
    gal.querySelector(".xg-gal__next").addEventListener("click", function () { show(cur + 1); });
    thumbs.forEach(function (t, k) { t.addEventListener("click", function () { show(k); }); });
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      pauseBtn.addEventListener("click", function () {
        userPaused = !userPaused;
        pauseBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
        pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
        if (userPaused) stop(); else schedule();
      });
    }
    var stage = gal.querySelector(".xg-gal__frame");
    stage.addEventListener("mouseenter", function () { hover = true; stop(); });
    stage.addEventListener("mouseleave", function () { hover = false; schedule(); });
    gal.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
    });
    // swipe
    var sx = null;
    stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) schedule(); else stop(); }, { threshold: .25 }).observe(gal);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else schedule(); });
    show(0);
  });
})();
