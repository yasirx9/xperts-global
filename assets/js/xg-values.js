/*!
 * Xperts Global — generic staggered reveal + FAQ accordion (xg-values.js)
 * [data-xg-reveal] container → children .xg-reveal-item fade up with 100ms stagger.
 * .xg-faq → accessible accordion with smooth height.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-xg-reveal]").forEach(function (box) {
    box.querySelectorAll(".xg-reveal-item").forEach(function (el, i) { el.style.setProperty("--i", i); });
    if (reduce || !("IntersectionObserver" in window)) { box.classList.add("is-in"); return; }
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { box.classList.add("is-in"); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(box);
  });

  document.querySelectorAll(".xg-faq").forEach(function (faq, fi) {
    faq.querySelectorAll(".xg-faq__item").forEach(function (item, i) {
      var btn = item.querySelector(".xg-faq__q"), panel = item.querySelector(".xg-faq__a");
      if (!btn || !panel) return;
      var id = "xg-faq-" + fi + "-" + i;
      panel.id = id; btn.setAttribute("aria-controls", id);
      btn.setAttribute("aria-expanded", item.classList.contains("is-open") ? "true" : "false");
      if (item.classList.contains("is-open")) panel.style.height = "auto";
      btn.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        // close siblings
        faq.querySelectorAll(".xg-faq__item.is-open").forEach(function (o) {
          if (o !== item) toggle(o, false);
        });
        toggle(item, open);
      });
    });
    function toggle(item, open) {
      var btn = item.querySelector(".xg-faq__q"), panel = item.querySelector(".xg-faq__a");
      var h = panel.scrollHeight;
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (reduce) { panel.style.height = open ? "auto" : "0"; return; }
      if (open) {
        panel.style.height = h + "px";
        panel.addEventListener("transitionend", function f() { panel.style.height = "auto"; panel.removeEventListener("transitionend", f); });
      } else {
        panel.style.height = h + "px"; void panel.offsetHeight; panel.style.height = "0";
      }
    }
  });
})();
