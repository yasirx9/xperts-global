/*!
 * Xperts Global — testimonials slider (xg-testimonials.js)
 * fade + slight slide, 6s autoplay paused on hover, ← 01 / 04 → counter, pill dots.
 */
(function () {
  "use strict";
  var sec = document.querySelector(".xg-testi");
  if (!sec || !window.Swiper) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var el = sec.querySelector(".xg-testi__swiper");
  var cur = sec.querySelector(".xg-testi__count b");
  var tot = sec.querySelector(".xg-testi__count span");
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  el.querySelectorAll(".swiper-slide").forEach(function (s) {
    s.querySelectorAll(".xg-stg").forEach(function (x, i) { x.style.setProperty("--s", i); });
  });

  var sw = new Swiper(el, {
    effect: reduce ? "fade" : "creative",
    creativeEffect: { prev: { opacity: 0, translate: ["-6%", 0, 0] }, next: { opacity: 0, translate: ["6%", 0, 0] } },
    fadeEffect: { crossFade: true },
    speed: reduce ? 0 : 800,
    loop: true,
    autoHeight: false,
    autoplay: reduce ? false : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true },
    navigation: { nextEl: sec.querySelector(".xg-testi__btn--next"), prevEl: sec.querySelector(".xg-testi__btn--prev") },
    pagination: { el: sec.querySelector(".xg-testi__dots"), clickable: true },
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: { prevSlideMessage: "Previous testimonial", nextSlideMessage: "Next testimonial", paginationBulletMessage: "Go to testimonial {{index}}" },
    on: {
      init: function (s) { if (tot) tot.textContent = pad(s.slides.length - (s.loopedSlides || 0) * 0); },
      slideChange: function (s) { if (cur) cur.textContent = pad(s.realIndex + 1); }
    }
  });
  if (tot) tot.textContent = pad(el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length);
  if (cur) cur.textContent = pad(sw.realIndex + 1);
  // pause when off-screen
  if (!reduce && "IntersectionObserver" in window && sw.autoplay) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? sw.autoplay.resume() : sw.autoplay.pause(); }).observe(sec);
  }
})();
