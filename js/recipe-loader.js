// js/recipe-loader.js

async function loadRecipe() {
  const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");

  if (!file) {
    document.getElementById("recipe-card").innerHTML =
      "<p>No recipe selected.</p>";
    return;
  }

  // Clean filename (just in case)
  const cleanFile = file.replace(/^recipes\//, "").trim();

  const owner = "alainord";
  const repo = "ReceiptApp";

  // 🔥 FIX: Local environment must point to /recipes/
  let rawUrl = isLocal
    ? `${window.location.origin}/recipes/${cleanFile}`
    : `https://raw.githubusercontent.com/${owner}/${repo}/main/recipes/${cleanFile}`;

  try {
    const mdText = await fetch(rawUrl).then((r) => r.text());
    // -----------------------------
    // FRONT MATTER (e.g. servings)
    // -----------------------------
    let servings = "";

    const fmMatch = mdText.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (fmMatch) {
      const fmContent = fmMatch[1];

      // Busca línea tipo: servings: 2
      const servingsMatch = fmContent.match(/^\s*servings\s*:\s*(.+)\s*$/im);
      if (servingsMatch) servings = servingsMatch[1].trim();
    }
    // Remove front matter from content to avoid showing it

    const mdNoFrontMatter = mdText.replace(/^\s*---\s*\n[\s\S]*?\n---\s*\n?/, "");

    /* -----------------------------
       EXTRACT TITLE, DESC, IMAGE
    ------------------------------*/
    const title = mdNoFrontMatter.match(/^#\s+(.*)/m)?.[1]?.trim() || cleanFile;

    const desc =
      mdText
        .replace(/^#.*$/m, "")
        .trim()
        .split("\n")
        .find((l) => l.trim().length > 0) || "";

    const imageMatch = mdText.match(/!\[[^\]]*\]\((.*?)\)/);
    const heroImage = imageMatch ? imageMatch[1] : "";

    /* -----------------------------
       INGREDIENTS (CATEGORIZED)
    ------------------------------*/
    let ingredients = [];
    const ingSection = mdText.match(/##\s*Ingredients([\s\S]*?)(##|$)/i);

    if (ingSection) {
      const lines = ingSection[1]
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      let currentCategory = "General";

      for (const line of lines) {
        const catMatch = line.match(/^\*\*(.+?)\*\*$/);
        if (catMatch) {
          currentCategory = catMatch[1].trim();
          continue;
        }

        const itemMatch = line.match(/^-+\s*(.+)$/);
        if (itemMatch) {
          ingredients.push({
            category: currentCategory,
            item: itemMatch[1].trim(),
          });
        }
      }
    }

    /* -----------------------------
       STEPS
    ------------------------------*/
    let steps = [];
    const stepsSection = mdText.match(/##\s*Steps([\s\S]*?)(##|$)/i);
    if (stepsSection) {
      steps = stepsSection[1]
        .split("\n")
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
    }

    /* -----------------------------
       TAGS
    ------------------------------*/
    let tags = [];
    const tagSection = mdText.match(/##\s*Tags([\s\S]*?)(##|$)/i);
    if (tagSection) {
      tags = tagSection[1]
        .split("\n")
        .map((l) => l.replace(/[-*]\s*/, "").trim())
        .filter(Boolean);
    }

    /* -----------------------------
       CLEAN BODY FOR RENDERING
    ------------------------------*/
    let cleanedMd = mdText;

    cleanedMd = cleanedMd.replace(/^#\s+.*$/m, "");

    if (desc) {
      const escDesc = desc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      cleanedMd = cleanedMd.replace(new RegExp(`^\\s*${escDesc}\\s*$`, "m"), "");
    }

    cleanedMd = cleanedMd.replace(/!\[[^\]]*\]\((.*?)\)/, "");
    cleanedMd = cleanedMd.replace(/##\s*Ingredients[\s\S]*?(?=##|$)/i, "");
    cleanedMd = cleanedMd.replace(/##\s*Steps[\s\S]*?(?=##|$)/i, "");
    cleanedMd = cleanedMd.replace(/##\s*Tags[\s\S]*?(?=##|$)/i, "");

    cleanedMd = cleanedMd.trim();

    const bodyHtml = marked.parse(cleanedMd);

    /* -----------------------------
       RENDER HTML
    ------------------------------*/
    const card = document.getElementById("recipe-card");

    card.innerHTML = `
      ${heroImage ? `<img src="${heroImage}" alt="${title}" class="hero-image" />` : ""}
      <h1>${title}</h1>
      ${servings ? `
        <div class="recipe-meta">
          <span class="meta-pill">👤 ${servings} ${String(servings).trim() === "1" ? "person" : "people"}</span>
        </div>
      ` : ""}

      ${tags.length ? `
        <div class="tag-list">
          ${tags.map(t => `<span class="recipe-tag" data-tag="${t}">${t}</span>`).join("")}
        </div>
      ` : ""}

      ${ingredients.length ? `
        <h2 class="section-title">Ingredients</h2>
        ${(() => {
          const groups = {};
          ingredients.forEach(ing => {
            (groups[ing.category] ||= []).push(ing.item);
          });

          return Object.entries(groups)
            .map(([cat, items]) => `
              <h3 class="ingredient-category">${cat}</h3>
              <ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>
            `)
            .join("");
        })()}
      ` : ""}

      ${steps.length ? `
        <h2 class="section-title">Steps</h2>
        <ol>${steps.map(s => `<li>${s}</li>`).join("")}</ol>
      ` : ""}

      <div class="content">${bodyHtml}</div>
    `;

    // Click tag → redirects to index with filter
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("recipe-tag")) {
        const tag = encodeURIComponent(e.target.dataset.tag);
        window.location.href = `index.html?tag=${tag}`;
      }
    });
  } catch (err) {
    console.error(err);
    document.getElementById("recipe-card").innerHTML =
      "<p>Could not load this recipe. Maybe it was deleted.</p>";
  }
}

loadRecipe();
