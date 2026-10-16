/*!
 * Xperts Global — inner pages (xg-inner.js)
 * page-hero word rise · clip-path reveals · services sidebar scroll-spy.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* 1. hero title word-rise */
  document.querySelectorAll(".xg-page-hero").forEach(function (hero) {
    var t = hero.querySelector(".xg-page-hero__title");
    if (t && !reduce) {
      var i = 0;
      t.innerHTML = t.textContent.trim().split(/\s+/).map(function (w) {
        return '<span class="xg-w"><span style="--i:' + (i++) + '">' + w + "</span></span>";
      }).join(" ");
    }
    requestAnimationFrame(function () { setTimeout(function () { hero.classList.add("is-in"); }, 120); });
  });

  /* 2. clip reveals */
  var clips = document.querySelectorAll(".xg-clip");
  if (reduce || !hasIO) clips.forEach(function (c) { c.classList.add("is-in"); });
  else {
    // observe the parent: a fully clipped element can report as not intersecting
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.__xgClip.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    clips.forEach(function (c) { var t = c.parentElement || c; t.__xgClip = c; io.observe(t); });
  }

  /* 3. sidebar: mark current page, scroll-spy for same-page anchors */
  var side = document.querySelector(".xg-svc-side");
  if (side) {
    var here = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
    var links = [].slice.call(side.querySelectorAll("a[href]"));
    var anchorLinks = [];
    links.forEach(function (a) {
      var url = new URL(a.getAttribute("href"), location.href);
      var p = url.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
      if (p === here) {
        if (url.hash) {
          var target = document.getElementById(url.hash.slice(1));
          if (target) anchorLinks.push({ a: a, t: target });
        } else if (!side.querySelector('a[href*="#"]') || !anchorLinks.length) {
          a.classList.add("is-active"); a.setAttribute("aria-current", "page");
        }
      }
    });
    if (anchorLinks.length && hasIO) {
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            anchorLinks.forEach(function (o) {
              var on = o.t === e.target;
              o.a.classList.toggle("is-active", on); o.t.classList.toggle("is-active", on);
              if (on) o.a.setAttribute("aria-current", "true"); else o.a.removeAttribute("aria-current");
            });
            // "All Services" active only before the first anchor
            links.forEach(function (l) { if (l.getAttribute("aria-current") === "page") { l.classList.remove("is-active"); l.removeAttribute("aria-current"); } });
          }
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      anchorLinks.forEach(function (o) { spy.observe(o.t); });
    }
  }
})();
