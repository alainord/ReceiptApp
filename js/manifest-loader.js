// js/manifest-loader.js

let allRecipes = [];

async function loadRecipes() {
  const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  let manifest;

  if (isLocal) {
    manifest = await fetch("./recipes/manifest.json").then((r) => r.json());
  } else {
    const owner = "alainord";
    const repo = "ReceiptApp";
    const path = "recipes/manifest.json";

    const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}/${path}`;
    manifest = await fetch(cdnUrl).then((r) => r.json());
  }

  allRecipes = manifest.map((r) => ({
    title: r.title,
    desc: r.description,
    image: r.image,
    tags: r.tags,
    url: `recipe.html?file=${encodeURIComponent(r.slug + ".md")}`,
  }));

  renderRecipes(allRecipes);
}

window.addEventListener("load", loadRecipes);
