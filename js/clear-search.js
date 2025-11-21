// js/clear-search.js

(function () {
  function clearSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;
    input.value = "";
    renderRecipes(allRecipes);
    input.focus();
  }

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "clear-search") {
      e.preventDefault();
      clearSearch();
    }
  });

  document
    .getElementById("search-input")
    ?.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") clearSearch();
    });
})();
