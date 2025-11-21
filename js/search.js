// js/search.js

let fuse;

// Cuando las recetas ya están cargadas desde manifest-loader.js
window.addEventListener("recipes-loaded", () => {
  fuse = new Fuse(allRecipes, {
    keys: ["title", "desc", "tags"],
    threshold: 0.45,   // Tolerancia a errores
    distance: 100,     // Permite fuzzy más inteligente
  });
});

// 🔍 Búsqueda mientras escribes
document.getElementById("search-input").addEventListener("input", (e) => {
  const query = e.target.value.trim();

  if (!query) {
    renderRecipes(allRecipes);
    return;
  }

  const results = fuse.search(query).map(r => r.item);
  renderRecipes(results);
});

// 🔥 Click en tag = búsqueda Fuse
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("recipe-tag")) {
    const tag = e.target.dataset.tag;

    const input = document.getElementById("search-input");
    input.value = tag;

    const results = fuse.search(tag).map(r => r.item);
    renderRecipes(results);
  }
});

// Cargar con ?tag=
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const tagFromUrl = params.get("tag");

  if (tagFromUrl) {
    const input = document.getElementById("search-input");
    input.value = tagFromUrl;

    const results = fuse.search(tagFromUrl).map(r => r.item);
    renderRecipes(results);
  }
});
