const API_URL = "COLLE_ICI_TON_URL_APPS_SCRIPT";

const form = document.getElementById("unionForm");
const submitBtn = document.getElementById("submitBtn");
const success = document.getElementById("success");
const steps = Array.from(document.querySelectorAll(".step"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressFill = document.querySelector(".progress-fill");
const progressStatus = document.querySelector(".progress-status");
const eaSplash = document.getElementById("ea-splash");
const unionLabBackground = document.getElementById("background-union-lab");
const unionLabCanvas = document.getElementById("union-lab-canvas");
const eaLogo = document.getElementById("ea-logo");
const appOnboarding = document.getElementById("app-onboarding");
const body = document.body;
const pronounSelect = document.getElementById("pronom");
const transitionMessage = document.getElementById("transitionMessage");
const finalReadyMessage = document.getElementById("finalReadyMessage");
const successMessage = document.getElementById("successMessage");
const formContent = document.querySelector(".form-content");
const setVh = () => {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
};

setVh();
window.addEventListener("resize", setVh);
window.addEventListener("orientationchange", setVh);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setVh);
}

const pronounMap = {
  "il / lui": {
    ready: "Tu peux poursuivre.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  "elle / elle": {
    ready: "Tu peux poursuivre.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  "iel": {
    ready: "Tu peux poursuivre.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  "default": {
    ready: "Tu peux poursuivre.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  }
};

let userPronoun = pronounSelect?.value || "default";

let currentStep = 1;
const totalSteps = steps.length;

function updateProgress() {
  const percent = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100;
  progressFill.style.width = `${percent}%`;
  progressStatus.textContent = `Étape ${currentStep} / ${totalSteps}`;
}

function updateNextState() {
  if (currentStep === totalSteps) return;
  const activeStep = steps[currentStep - 1];
  const requiredFields = activeStep.querySelectorAll("input[required], select[required], textarea[required]");

  if (!requiredFields.length) {
    nextBtn.disabled = false;
    return;
  }

  const allValid = Array.from(requiredFields).every((field) => field.value.trim() !== "");
  nextBtn.disabled = !allValid;
}

function showStep(step) {
  currentStep = step;
  steps.forEach((element, index) => {
    const isActive = index === step - 1;
    element.classList.toggle("active", isActive);
    element.setAttribute("aria-hidden", String(!isActive));
  });

  prevBtn.hidden = currentStep === 1;
  nextBtn.hidden = currentStep === totalSteps;
  submitBtn.hidden = currentStep !== totalSteps;
  nextBtn.textContent = currentStep === 1 ? "Commencer" : "Suivant";

  updateProgress();
  updateNextState();
  resetScrollPosition();
  updateTransitionCopy();
}

function updateTransitionCopy() {
  if (!transitionMessage) return;
  transitionMessage.textContent = `Tu avances vite — étape ${currentStep} / ${totalSteps}.`;
}

function resolvePronounText(key) {
  return pronounMap[key] || pronounMap.default;
}

function updateDynamicText() {
  const { ready, thanks } = resolvePronounText(userPronoun);

  if (transitionMessage) transitionMessage.textContent = ready;
  if (finalReadyMessage) finalReadyMessage.textContent = ready;
  if (successMessage) successMessage.textContent = thanks;
}

function resetScrollPosition() {
  if (body.classList.contains("splash-active")) return;
  if (formContent) {
    formContent.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  if (window.scrollY > 16) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
}

const visuals = typeof setupVisualManager === "function"
  ? setupVisualManager({
      body,
      eaSplash,
      unionLabBackground,
      unionLabCanvas,
      eaLogo,
      appOnboarding,
      onSplashFinish: () => showStep(currentStep)
    })
  : null;

pronounSelect?.addEventListener("change", (event) => {
  userPronoun = event.target.value || "default";
  updateDynamicText();
});


nextBtn.addEventListener("click", () => {
  if (nextBtn.disabled || currentStep >= totalSteps) return;
  showStep(currentStep + 1);
});

prevBtn.addEventListener("click", () => {
  if (currentStep <= 1) return;
  showStep(currentStep - 1);
});

form.addEventListener("input", (event) => {
  if (event.target.closest(".step.active")) {
    updateNextState();
  }
});

form.addEventListener("change", (event) => {
  if (event.target.closest(".step.active")) {
    updateNextState();
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi…";

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    form.hidden = true;
    success.hidden = false;

  } catch (err) {
    alert("Erreur lors de l’envoi. Réessaie.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer";
  }
});

updateDynamicText();
showStep(currentStep);
visuals?.initUnionLabAnimation();
visuals?.startSplashSequence();
