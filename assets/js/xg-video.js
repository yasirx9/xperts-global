/* Xperts Global · video testimonials: opens the clip in a native <dialog>. */
(function () {
  "use strict";
  var modal = document.querySelector(".xg-vmodal");
  if (!modal) return;
  var video = modal.querySelector("video"), opener = null;
  function close() {
    video.pause(); video.removeAttribute("src"); video.load();
    if (modal.open) modal.close();
    if (opener) opener.focus();
  }
  document.querySelectorAll(".xg-vtesti__play").forEach(function (btn) {
    btn.addEventListener("click", function () {
      opener = btn;
      video.src = btn.getAttribute("data-video");
      if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
      var p = video.play(); if (p && p.catch) p.catch(function () {});
    });
  });
  modal.querySelector(".xg-vmodal__close").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  modal.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
})();
