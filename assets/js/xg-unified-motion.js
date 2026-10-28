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
})();
