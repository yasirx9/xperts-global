/*!
 * Xperts Global — global motion layer (xg-motion.js)
 * 1 Lenis smooth scroll (+ GSAP ScrollTrigger sync)  2 data-xg reveal system  3 split headings
 * 4 first-visit loader  5 custom cursor  6 page-transition curtain
 */
(function () {
  "use strict";
  window.__xgMotion = true;
  var root = document.documentElement;
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var fine = mq("(hover: hover) and (pointer: fine)");
  var touch = !fine || ("ontouchstart" in window && navigator.maxTouchPoints > 0 && !fine);

  /* ---------- 1. Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduce && !touch && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.xgLenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // same-page anchors through Lenis (offset for the sticky header)
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
      var t = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -96 });
      history.pushState(null, "", url.hash);
    });
  }

  /* ---------- 2 + 3. data-xg reveal system & split headings ---------- */
  function splitWords(el) {
    if (el.__xgSplit) return; el.__xgSplit = true;
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var i = 0;
    var walk = function (node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var o = document.createElement("span"); o.className = "xg-sw"; o.setAttribute("aria-hidden", "true");
            var w = document.createElement("span"); w.textContent = part; w.style.setProperty("--i", i++);
            o.appendChild(w); frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG)$/.test(n.tagName)) walk(n);
      });
    };
    walk(el);
  }
  var items = [].slice.call(document.querySelectorAll("[data-xg]"));
  items.forEach(function (el) {
    var d = parseFloat(el.getAttribute("data-xg-delay"));
    if (!isNaN(d)) el.style.setProperty("--xg-delay", (d > 20 ? d : d * 1000) + "ms");
    if (el.getAttribute("data-xg") === "split" && !reduce) splitWords(el);
  });
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("xg-in"); });
  } else {
    root.classList.add("xg-motion");
    // clip-reveal boxes are observed through their parent: a fully clipped box never reports an intersection
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (e.target.__xgTargets || [e.target]).forEach(function (t) { t.classList.add("xg-in"); });
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) {
      var watch = el.getAttribute("data-xg") === "clip-reveal" && el.parentElement ? el.parentElement : el;
      if (watch !== el) { (watch.__xgTargets = watch.__xgTargets || []).push(el); }
      io.observe(watch);
    });
  }

  /* ---------- 4. first-visit loader ---------- */
  var loader = document.querySelector(".xg-loader");
  function revealed() { try { document.dispatchEvent(new CustomEvent("xg:revealed")); } catch (e) {} }
  if (loader && root.classList.contains("xg-first")) {
    var done = false;
    var finish = function () {
      if (done) return; done = true;
      root.classList.add("xg-loaded");
      setTimeout(function () { root.classList.remove("xg-first"); revealed(); }, reduce ? 0 : 800);
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 1200);
    };
    if (document.readyState === "complete") setTimeout(finish, 350); else window.addEventListener("load", function () { setTimeout(finish, 350); });
    setTimeout(finish, 3500); // never block the page longer than this
  } else {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    revealed();
  }

  /* ---------- 5. custom cursor ---------- */
  if (fine && !reduce) {
    var dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "xg-cursor-dot"; ring.className = "xg-cursor-ring";
    ring.innerHTML = '<span class="xg-cursor-label">View</span>';
    dot.setAttribute("aria-hidden", "true"); ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot); document.body.appendChild(ring);
    root.classList.add("xg-has-cursor");
    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; rx = mx; ry = my; root.classList.add("xg-cursor-on"); }
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    }, { passive: true });
    document.addEventListener("mouseleave", function () { root.classList.remove("xg-cursor-on"); shown = false; });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    })();
    var VIEW = ".xg-work__item, .single-case-studies, .xg-browser, .xg-video";
    var HOT = "a, button, [role='tab'], label, select, .swiper-pagination-bullet";
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      var view = t.closest && t.closest(VIEW);
      root.classList.toggle("xg-cursor-view", !!view && !(t.closest(HOT) && !t.closest(".xg-work__link, .single-case-studies .thumbnail")));
      root.classList.toggle("xg-cursor-hot", !view && !!(t.closest && t.closest(HOT)));
      root.classList.toggle("xg-cursor-text", !!(t.closest && t.closest("input, textarea, [contenteditable]")));
    });
    document.addEventListener("mousedown", function () { root.classList.add("xg-cursor-down"); });
    document.addEventListener("mouseup", function () { root.classList.remove("xg-cursor-down"); });
  }

  /* ---------- 6. page transitions ---------- */
  var curtain = document.createElement("div");
  curtain.className = "xg-curtain"; curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);
  if (!reduce) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.getAttribute("data-no-transition") !== null) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (a.classList.contains("popup-video") || a.classList.contains("popup-youtube")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // same-page anchor
      e.preventDefault();
      root.classList.add("xg-leaving");
      setTimeout(function () { location.href = url.href; }, 380);
    });
    window.addEventListener("pageshow", function (ev) { if (ev.persisted) root.classList.remove("xg-leaving"); });
  }
})();
