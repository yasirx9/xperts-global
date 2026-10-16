(function () {
  "use strict";

  function scrollToForm(event) {
    var target = document.getElementById("broadband-availability");
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var selectedPlan = document.getElementById("selected_plan");
    var internetOption = document.querySelector('input[name="selected_service"][value="Internet"]');
    var planButtons = document.querySelectorAll(".broadband-plan-select");
    var scrollLinks = document.querySelectorAll(".broadband-scroll-link");

    scrollLinks.forEach(function (link) {
      link.addEventListener("click", scrollToForm);
    });

    planButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        if (selectedPlan) {
          selectedPlan.value = button.getAttribute("data-plan") || "";
        }

        if (internetOption) {
          internetOption.checked = true;
        }

        scrollToForm(event);
      });
    });
  });
})();
