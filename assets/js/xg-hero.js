/*!
 * Xperts Global — Home hero (xg-hero.js)
 * rising light-lines canvas, typewriter, GSAP intro timeline.
 */
(function () {
  "use strict";
  var hero = document.querySelector(".xg-hero");
  if (!hero) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- 1. split H1 static words for the mask-rise ---------- */
  var stat = hero.querySelector(".xg-hero__static");
  if (stat) {
    stat.innerHTML = stat.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="xg-w"><span>' + w + "</span></span>";
    }).join(" ");
  }
  var typedWrap = hero.querySelector(".xg-hero__typed");
  if (typedWrap) typedWrap.innerHTML = '<span class="xg-w"><span>' + typedWrap.innerHTML + "</span></span>";

  /* ---------- 2. typewriter ---------- */
  var typeEl = hero.querySelector(".xg-type");
  function startTypewriter() {
    if (!typeEl || reduce) return;
    var phrases;
    try { phrases = JSON.parse(typeEl.getAttribute("data-phrases")); } catch (e) { phrases = null; }
    if (!phrases || !phrases.length) phrases = [typeEl.textContent];
    var i = 0, txt = "", deleting = false, full = phrases[0];
    // first phrase is "typed" from empty
    typeEl.textContent = "";
    function tick() {
      full = phrases[i % phrases.length];
      if (!deleting) {
        txt = full.slice(0, txt.length + 1);
        typeEl.textContent = txt;
        if (txt === full) {
          if (phrases.length === 1) return;          // single phrase: type once, keep caret blinking
          deleting = true; return setTimeout(tick, 2600);
        }
        return setTimeout(tick, 70 + Math.random() * 60);
      }
      txt = full.slice(0, txt.length - 1);
      typeEl.textContent = txt;
      if (!txt) { deleting = false; i++; return setTimeout(tick, 350); }
      setTimeout(tick, 38);
    }
    tick();
  }

  /* ---------- 3. rising light lines canvas ---------- */
  function startRain() {
    var cv = hero.querySelector(".xg-hero__rain");
    if (!cv || reduce || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W, H, lines = [], running = false, visible = true, last = 0, raf;
    function mk(initial) {
      var red = Math.random() < 0.55;
      return {
        x: Math.round(Math.random() * W),
        y: initial ? Math.random() * H : H + Math.random() * H * 0.4,
        len: (40 + Math.random() * 160) * dpr,
        sp: (0.4 + Math.random() * 1.4) * dpr,
        w: (Math.random() < 0.2 ? 2 : 1) * dpr,
        c: red ? "227,66,52" : "255,255,255",
        a: red ? 0.55 + Math.random() * 0.45 : 0.25 + Math.random() * 0.35
      };
    }
    function size() {
      W = cv.width = Math.round(cv.clientWidth * dpr);
      H = cv.height = Math.round(cv.clientHeight * dpr);
      var n = Math.round(Math.min(70, Math.max(24, cv.clientWidth / 22)));
      lines = []; for (var i = 0; i < n; i++) lines.push(mk(true));
    }
    function draw(t) {
      raf = requestAnimationFrame(draw);
      if (t - last < 33) return;                 // ~30fps cap
      last = t;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        l.y -= l.sp * 2;
        if (l.y + l.len < 0) { lines[i] = mk(false); continue; }
        var g = ctx.createLinearGradient(0, l.y, 0, l.y + l.len);
        g.addColorStop(0, "rgba(" + l.c + "," + l.a + ")");
        g.addColorStop(1, "rgba(" + l.c + ",0)");
        // soft glow pass + core pass (cheaper than shadowBlur)
        ctx.fillStyle = "rgba(" + l.c + "," + (l.a * 0.12) + ")";
        ctx.fillRect(l.x - 3 * dpr, l.y, l.w + 6 * dpr, l.len * 0.6);
        ctx.fillStyle = g;
        ctx.fillRect(l.x, l.y, l.w, l.len);
        // bright head
        ctx.fillStyle = "rgba(" + l.c + "," + Math.min(1, l.a + 0.3) + ")";
        ctx.fillRect(l.x - dpr, l.y, l.w + 2 * dpr, 2 * dpr);
      }
      ctx.globalCompositeOperation = "source-over";
    }
    function play() { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(draw); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); play();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? play() : stop(); }).observe(hero);
    }
  }

  /* ---------- 4. intro timeline ---------- */
  function intro() {
    var done = false;
    function finish() { if (done) return; done = true; root.classList.remove("xg-intro"); startTypewriter(); }
    if (reduce || !window.gsap) { finish(); return; }
    var g = window.gsap;
    var tl = g.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });
    tl.to(".xg-hero__pill", { opacity: 1, y: 0, duration: .45, startAt: { y: 16 } })
      .to(".xg-hero__title .xg-w > span", { y: "0%", duration: .7, stagger: .06 }, "-=.2")
      .to(".xg-hero__lead", { opacity: 1, y: 0, duration: .5, startAt: { y: 18 } }, "-=.45")
      .to(".xg-hero__actions", { opacity: 1, y: 0, duration: .45, startAt: { y: 18 } }, "-=.32")
      .to(".xg-glass-wrap", { opacity: 1, x: 0, duration: .7, startAt: { x: 40 } }, "-=.6")
      .to(".xg-hero__strip", { opacity: 1, y: 0, duration: .5, startAt: { y: 20 } }, "-=.35");
    // keep total under 1.6s regardless of word count
    if (tl.duration() > 1.55) tl.timeScale(tl.duration() / 1.55);
    setTimeout(finish, 3500); // safety
  }

  function begin() { startRain(); intro(); }
  // wait for the first-visit loader (xg-motion.js fires "xg:revealed") so the intro is actually seen
  if (document.documentElement.classList.contains("xg-first")) {
    var started = false;
    var go = function () { if (!started) { started = true; setTimeout(begin, 150); } };
    document.addEventListener("xg:revealed", go);
    setTimeout(go, 4000);
  } else begin();
})();
