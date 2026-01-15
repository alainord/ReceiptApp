// js/cooking-mode.js
(() => {
  const openBtn = document.getElementById("openCooking");
  const overlay = document.getElementById("cookingOverlay");
  const closeBtn = document.getElementById("closeCooking");
  const stepText = document.getElementById("cookStepText");
  const progress = document.getElementById("cookProgress");
  const nextBtn = document.getElementById("nextStep");
  const prevBtn = document.getElementById("prevStep");
  const recipeCard = document.getElementById("recipe-card");

  if (!openBtn || !overlay || !recipeCard) return;

  let steps = [];
  let currentStep = 0;
  let wakeLock = null;

  function getStepsFromRecipe() {
    // Prefer steps list inside the "Steps" section if you can.
    // Simple approach: first ordered list in the recipe card.
    const ol = recipeCard.querySelector("ol");
    if (!ol) return [];
    return Array.from(ol.querySelectorAll("li"))
      .map(li => li.textContent.trim())
      .filter(Boolean);
  }

  function renderStep() {
    if (!steps.length) {
      stepText.textContent = "No steps found in this recipe.";
      progress.textContent = "Step 0 / 0";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    stepText.textContent = steps[currentStep];
    progress.textContent = `Step ${currentStep + 1} / ${steps.length}`;
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;
  }

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
        // If the page loses visibility, wake lock might be released
        document.addEventListener("visibilitychange", async () => {
          if (wakeLock && document.visibilityState === "visible") {
            try { wakeLock = await navigator.wakeLock.request("screen"); } catch {}
          }
        });
      }
    } catch {
      // ignore
    }
  }

  function releaseWakeLock() {
    try { wakeLock?.release?.(); } catch {}
    wakeLock = null;
  }

  function openCooking() {
    steps = getStepsFromRecipe();

    // If still not loaded, try again after a tiny delay
    if (!steps.length) {
      setTimeout(() => {
        steps = getStepsFromRecipe();
        currentStep = 0;
        overlay.classList.remove("hidden");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        renderStep();
        requestWakeLock();
      }, 150);
      return;
    }

    currentStep = 0;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderStep();
    requestWakeLock();
  }

  function closeCooking() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    releaseWakeLock();
  }

  openBtn.addEventListener("click", openCooking);
  closeBtn.addEventListener("click", closeCooking);

  nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
    }
  });

  // Keyboard support (nice on desktop)
  document.addEventListener("keydown", (e) => {
    if (overlay.classList.contains("hidden")) return;
    if (e.key === "Escape") closeCooking();
    if (e.key === "ArrowRight") nextBtn.click();
    if (e.key === "ArrowLeft") prevBtn.click();
  });

  // Extra-robust: if recipe-loader updates #recipe-card later, the steps will be there.
  // (No need to do anything else unless you want auto-refresh.)
})();
