// scripts/generateManifest.js

const fs = require("fs");
const path = require("path");

const RECIPES_DIR = path.join(__dirname, "../recipes");
const OUTPUT_FILE = path.join(RECIPES_DIR, "manifest.json");

// Extract simple matches
function extract(regex, content) {
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

// Extract tags (lines beginning with "-")
function extractTags(content) {
  const tagsIndex = content.indexOf("## Tags");
  if (tagsIndex === -1) return [];

  const tagsText = content.slice(tagsIndex).split("\n").slice(1); // skip "## Tags" line

  return tagsText
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace("-", "").trim());
}

// Extract image path from ![ ]( )
function extractImage(content) {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

function generateManifest() {
  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".md"));

  const manifest = files.map((file) => {
    const fullPath = path.join(RECIPES_DIR, file);
    const content = fs.readFileSync(fullPath, "utf-8");

    // 1. Title
    const title = extract(/^# (.*)/m, content);

    // 2. Description (the paragraph right after the title)
    const description = extract(/^#.*?\n+(.+?)\n/m, content);

    // 3. Image src
    const image = extractImage(content);

    // 4. Tags list
    const tags = extractTags(content);

    return {
      slug: file.replace(".md", ""),
      title,
      description,
      image,
      tags,
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log("Manifest generado correctamente en:", OUTPUT_FILE);
}

generateManifest();
