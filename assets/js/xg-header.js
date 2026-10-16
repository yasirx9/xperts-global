/*!
 * Xperts Global — Header behaviour (xg-header.js)
 * sticky + shrink after 80px, hide on scroll-down / reveal on scroll-up,
 * scroll progress bar, accessible mega menu, active-link marking, transparent mode over a dark hero.
 */
(function () {
  "use strict";
  var header = document.getElementById("xg-header");
  if (!header) return;
  var body = document.body;
  var bar = document.querySelector(".xg-progress__bar");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. transparent mode when the page starts with a dark hero */
  if (document.querySelector(".xg-hero-dark")) {
    body.classList.add("xg-has-dark-hero");
    header.classList.add("xg-header--over-dark");
  }

  /* 2. mark the current page link */
  var path = location.pathname.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/\/+$/, "") || "/";
  document.querySelectorAll(".xg-nav__link, .side-bar.xg-offcanvas a.main").forEach(function (a) {
    var href = (a.getAttribute("href") || "").replace(/\.html$/, "").replace(/\/+$/, "") || "/";
    if (href === path) a.setAttribute("aria-current", "page");
  });

  /* 3. scroll: sticky / shrink / hide-reveal / progress */
  var lastY = window.pageYOffset, ticking = false, megaOpen = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (y > 80) header.classList.add("is-stuck");
    else header.classList.remove("is-stuck", "is-hidden");

    if (y > 80 && !megaOpen) {
      if (y > lastY + 4 && y > 300) header.classList.add("is-hidden");
      else if (y < lastY - 4) header.classList.remove("is-hidden");
    }
    lastY = y;

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* 4. mega menu (hover, focus, click on touch, Esc) */
  var item = header.querySelector(".xg-nav__item--mega");
  if (item) {
    var trigger = item.querySelector(".xg-nav__link");
    var closeT;
    var open = function () {
      clearTimeout(closeT); item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true"); megaOpen = true;
      header.classList.remove("is-hidden");
    };
    var close = function () {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false"); megaOpen = false;
    };
    var escaped = false; // after Esc, keep it closed while focus stays on the trigger
    item.addEventListener("mouseenter", function () { escaped = false; open(); });
    item.addEventListener("mouseleave", function () { closeT = setTimeout(close, reduce ? 0 : 160); });
    item.addEventListener("focusin", function () { if (!escaped) open(); });
    item.addEventListener("focusout", function (e) { if (!item.contains(e.relatedTarget)) { escaped = false; close(); } });
    // touch devices: first tap opens, second tap follows the link
    trigger.addEventListener("click", function (e) {
      if (window.matchMedia("(hover: none)").matches && !item.classList.contains("is-open")) {
        e.preventDefault(); open();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.classList.contains("is-open")) { escaped = true; close(); trigger.focus(); }
    });
    document.addEventListener("click", function (e) { if (!item.contains(e.target)) close(); });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); escaped = false; open(); var f = item.querySelector(".xg-mega a"); if (f) f.focus(); }
    });
  }

  /* 5. off-canvas: aria + stagger index (open/close itself is handled by main.js) */
  var side = document.getElementById("side-bar");
  var burger = header.querySelector(".xg-burger");
  if (side) {
    side.querySelectorAll(".mobile-menu-main nav ul > li, .xg-offcanvas__cta, .rts-social-border-area")
      .forEach(function (el, i) { el.style.setProperty("--i", i); });
    if (burger) {
      new MutationObserver(function () {
        var shown = side.classList.contains("show");
        burger.setAttribute("aria-expanded", shown ? "true" : "false");
        body.style.overflow = shown ? "hidden" : "";
      }).observe(side, { attributes: true, attributeFilter: ["class"] });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && side.classList.contains("show")) {
        side.classList.remove("show");
        var o = document.getElementById("anywhere-home"); if (o) o.classList.remove("bgshow");
        if (burger) burger.focus();
      }
    });
  }
})();
