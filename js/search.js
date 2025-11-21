// js/search.js

document.getElementById("search-input").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  const filtered = allRecipes.filter(
    (r) =>
      r.title.toLowerCase().includes(query) ||
      r.tags.some((t) => t.toLowerCase().includes(query))
  );

  renderRecipes(filtered);
});

// Click en tag
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("recipe-tag")) {
    const tag = e.target.dataset.tag.toLowerCase();

    const input = document.getElementById("search-input");
    input.value = tag;

    const filtered = allRecipes.filter((r) =>
      r.tags.some((t) => t.toLowerCase().includes(tag))
    );

    renderRecipes(filtered);
  }
});

// Cargar búsqueda desde ?tag=
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const tagFromUrl = params.get("tag");

  if (tagFromUrl) {
    const input = document.getElementById("search-input");
    const query = tagFromUrl.toLowerCase();
    input.value = tagFromUrl;

    const filtered = allRecipes.filter(
      (r) =>
        r.tags.some((t) => t.toLowerCase().includes(query)) ||
        r.title.toLowerCase().includes(query)
    );

    renderRecipes(filtered);
  }
});
