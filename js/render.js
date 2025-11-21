// js/render.js

function renderRecipes(list) {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `<p class="empty">No matching recipes found.</p>`;
    return;
  }

  list.forEach((r) => {
    container.innerHTML += `
      <article class="recipe-card">
        ${r.image ? `<img src="${r.image}" class="recipe-image" />`
                   : `<div class="recipe-image no-img"></div>`}

        ${r.tags.length
          ? `
          <div class="tag-list">
            ${r.tags
              .map((t) => `<span class="recipe-tag" data-tag="${t}">${t}</span>`)
              .join("")}
          </div>`
          : ""}

        <h2 class="recipe-title">${r.title}</h2>
        <p class="recipe-desc">${r.desc}</p>

        <div class="card-footer">
          <a class="btn" href="${r.url}">View recipe</a>
        </div>
      </article>
    `;
  });
}
