/* Adds the Blog-style reveal rhythm to every XG page when unified light mode is enabled. */
(function () {
  "use strict";
  if (!window.XG_CONFIG || window.XG_CONFIG.unifiedLightTheme !== true) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var selector = [
    ".xg-page-hero__inner",
    ".xg-section > .container",
    ".xg-final > .container",
    ".xg-footer > .container",
    ".xg-404 > *"
  ].join(",");
  var targets = [].slice.call(document.querySelectorAll(selector)).filter(function (el) {
    return !el.hasAttribute("data-xg") && !el.closest(".xg-loader");
  });
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
  targets.forEach(function (el) {
    el.classList.add("xg-unified-reveal");
    observer.observe(el);
  });

  /* Shared dotted wave: the same visual language as the Blog masthead. */
  if (!reduce) {
    [].slice.call(document.querySelectorAll(".xg-page-hero, .xg-hero, .xg-404, .broadband-hero")).forEach(function (hero) {
      if (hero.querySelector(".xg-dot-wave")) return;
      var canvas = document.createElement("canvas");
      canvas.className = "xg-dot-wave";
      canvas.setAttribute("aria-hidden", "true");
      hero.appendChild(canvas);
      var ctx = canvas.getContext("2d"), frame = 0, visible = true, width, height, ratio;
      function draw(time) {
        if (!visible) { frame = 0; return; }
        var rect = hero.getBoundingClientRect();
        var nextWidth = Math.max(1, Math.round(rect.width));
        var nextHeight = Math.max(1, Math.round(rect.height));
        if (nextWidth !== width || nextHeight !== height) {
          width = nextWidth; height = nextHeight; ratio = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = width * ratio; canvas.height = height * ratio;
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
        ctx.clearRect(0, 0, width, height);
        var gap = Math.max(13, Math.min(21, width / 82));
        for (var x = width * .1; x < width * 1.05; x += gap) {
          for (var y = height * .28; y < height * 1.08; y += gap) {
            var wave = Math.sin((x * .018) + (time * .00055)) * 17 + Math.cos((y * .035) - (time * .0004)) * 8;
            var depth = Math.max(0, Math.min(1, (y - height * .22) / (height * .72)));
            var size = .8 + depth * .9;
            ctx.fillStyle = ((Math.round(x / gap) + Math.round(y / gap)) % 29 === 0) ? "rgba(225,6,0,.48)" : "rgba(10,10,10,.34)";
            ctx.beginPath(); ctx.arc(x, y + wave, size, 0, Math.PI * 2); ctx.fill();
          }
        }
        frame = requestAnimationFrame(draw);
      }
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(draw);
      }, { threshold: .02 }).observe(hero);
      frame = requestAnimationFrame(draw);
    });
  }
})();
