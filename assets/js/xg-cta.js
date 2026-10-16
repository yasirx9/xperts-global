/*!
 * Xperts Global — CTA band (xg-cta.js): word-mask heading reveal + Ken Burns only while visible.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".xg-cta-band").forEach(function (band) {
    var t = band.querySelector(".xg-cta-band__title");
    if (t && !reduce) {
      var i = 0;
      t.innerHTML = t.textContent.trim().split(/\s+/).map(function (w) {
        return '<span class="xg-w"><span style="--i:' + (i++) + '">' + w + "</span></span>";
      }).join(" ");
    }
    if (reduce || !("IntersectionObserver" in window)) { band.classList.add("is-in"); return; }
    new IntersectionObserver(function (e) {
      // reveal once; Ken Burns pauses again when off-screen
      if (e[0].isIntersecting) band.classList.add("is-in", "was-in");
      else band.classList.remove("is-in");
    }, { threshold: 0.3 }).observe(band);
  });
})();
