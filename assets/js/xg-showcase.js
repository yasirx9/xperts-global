/*!
 * Xperts Global — services device showcase (xg-showcase.js)
 * Two synced Swipers (browser + phone) driven by an accessible tab row,
 * 4s autoplay with a progress bar, paused on hover / focus / off-screen.
 */
(function () {
  "use strict";
  var sec = document.querySelector(".xg-showcase");
  if (!sec || !window.Swiper) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tabs = [].slice.call(sec.querySelectorAll(".xg-sc-tab"));
  var DUR = 4000;
  sec.style.setProperty("--xg-sc-dur", DUR + "ms");

  var common = { effect: "fade", fadeEffect: { crossFade: true }, speed: reduce ? 0 : 700, loop: false };
  var phone = new Swiper(sec.querySelector(".xg-sc-phone"), Object.assign({}, common, { allowTouchMove: false }));
  var desk = new Swiper(sec.querySelector(".xg-sc-desk"), Object.assign({}, common, {
    a11y: { enabled: false },
    on: { slideChange: function (s) { phone.slideTo(s.activeIndex); setActive(s.activeIndex); } }
  }));

  var current = 0;
  function setActive(i) {
    current = i;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      // restart the progress bar animation
      var bar = t.querySelector(".xg-sc-tab__bar i");
      if (on && bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
    });
    // keep the active tab in view on the mobile scroll row
    var a = tabs[i];
    if (a && a.parentNode.scrollWidth > a.parentNode.clientWidth) {
      a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
    }
  }
  function go(i) { desk.slideTo((i + tabs.length) % tabs.length); }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { go(i); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight") n = i + 1; else if (k === "ArrowLeft") n = i - 1;
      else if (k === "Home") n = 0; else if (k === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); n = (n + tabs.length) % tabs.length; go(n); tabs[n].focus(); }
    });
    // progress bar end → next slide
    var bar = t.querySelector(".xg-sc-tab__bar i");
    if (bar) bar.addEventListener("animationend", function () {
      if (sec.classList.contains("is-autoplay") && i === current) go(i + 1);
    });
  });
  setActive(0);

  if (reduce) return; // no autoplay for reduced motion
  sec.classList.add("is-autoplay");
  var hover = false, focus = false, visible = false;
  function sync() { sec.classList.toggle("is-paused", hover || focus || !visible || document.hidden); }
  var stage = sec.querySelector(".xg-showcase__interactive");
  (stage || sec).addEventListener("mouseenter", function () { hover = true; sync(); });
  (stage || sec).addEventListener("mouseleave", function () { hover = false; sync(); });
  sec.addEventListener("focusin", function () { focus = true; sync(); });
  sec.addEventListener("focusout", function (e) { if (!sec.contains(e.relatedTarget)) { focus = false; sync(); } });
  document.addEventListener("visibilitychange", sync);
  desk.on("touchStart", function () { hover = true; sync(); });
  desk.on("touchEnd", function () { setTimeout(function () { hover = false; sync(); }, 1500); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0.35 }).observe(sec);
  } else { visible = true; }
  sync();
})();
