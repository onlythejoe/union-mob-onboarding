const API_URL = "COLLE_ICI_TON_URL_APPS_SCRIPT";

const form = document.getElementById("unionForm");
const previewCardBtn = document.getElementById("preview-card-btn");
const success = document.getElementById("success");
const steps = Array.from(document.querySelectorAll(".step"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressFill = document.querySelector(".progress-fill");
const progressStatus = document.querySelector(".progress-status");
const eaSplash = document.getElementById("ea-splash");
const unionLabBackground = document.getElementById("background-union-lab");
const unionLabCanvas = document.getElementById("background-union-lab");
const eaLogo = document.getElementById("ea-logo");
const appOnboarding = document.getElementById("app-onboarding");
const body = document.body;
const pronounSelect = document.getElementById("pronom");
const transitionMessage = document.getElementById("transitionMessage");
const finalReadyMessage = document.getElementById("finalReadyMessage");
const successMessage = document.getElementById("successMessage");
const formContent = document.querySelector(".form-content");
const membershipCard = document.getElementById("membership-card");
const membershipCardName = document.querySelector("[data-card-name]");
const membershipCardUnions = document.querySelector("[data-card-unions]");
const membershipCardZones = document.querySelector("[data-card-zones]");
const membershipCardLink = document.querySelector("[data-card-link]");
const membershipCardNotes = document.querySelector("[data-card-notes]");
const membershipDownload = document.getElementById("membership-download");
const membershipSend = document.getElementById("membership-send");
const membershipClose = document.getElementById("membership-close");
const pronounFeedback = document.getElementById("pronoun-feedback");
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
    transitionSuffix: "On est avec toi.",
    closing: "L’espace est ouvert pour toi.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  "elle / elle": {
    transitionSuffix: "On est avec toi.",
    closing: "L’espace est ouvert pour toi.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  "iel": {
    transitionSuffix: "On est avec toi.",
    closing: "L’espace est ouvert pour toi.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  "default": {
    transitionSuffix: "",
    closing: "L’espace est ouvert.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  }
};

let userPronoun = pronounSelect?.value || "default";

let currentStep = 1;
const totalSteps = steps.length;
let hasProgressed = false;
const transitionCopyMap = {
  2: "La base est posée.",
  3: "On affine ton lien au collectif.",
  4: "On trace tes zones d’expression.",
  5: "On dévoile tes talents.",
  6: "Tu précises ta motivation.",
  7: "Ton parcours est complet."
};

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
  previewCardBtn.hidden = currentStep !== totalSteps;
  nextBtn.textContent = currentStep === 1 ? "Commencer" : "Suivant";

  updateProgress();
  updateNextState();
  resetScrollPosition();
  updateTransitionCopy();
}

function updateTransitionCopy() {
  if (!transitionMessage) return;
  if (!hasProgressed && currentStep === 1) {
    transitionMessage.textContent = "Tu es ici.";
    return;
  }
  if (currentStep > 1) {
    hasProgressed = true;
  }
  const baseText = transitionCopyMap[currentStep] || `Tu avances vite — étape ${currentStep} / ${totalSteps}.`;
  const pronounText = resolvePronounText(userPronoun);
  const suffix = pronounText.transitionSuffix ? ` ${pronounText.transitionSuffix}` : "";
  transitionMessage.textContent = `${baseText}${suffix}`;
}

function resolvePronounText(key) {
  return pronounMap[key] || pronounMap.default;
}

function updatePronounFeedback() {
  if (!pronounFeedback) return;
  if (pronounSelect?.value) {
    pronounFeedback.textContent = "On t’adresse selon ce pronom pour rester aligné·e.";
    return;
  }
  pronounFeedback.textContent = "Ton langage neutre reste privilégié tant que tu ne précises rien.";
}

function updateDynamicText() {
  const pronounText = resolvePronounText(userPronoun);
  if (finalReadyMessage) finalReadyMessage.textContent = pronounText.closing;
  if (successMessage) successMessage.textContent = pronounText.thanks;
}

let membershipCardData = null;

function buildMembershipCardPayload(data) {
  const nameParts = [data.prenom, data.nom].filter(Boolean);
  const name = nameParts.length ? nameParts.join(" ") : "Union Mob";
  const unions = [data.union_principale, data.union_secondaire].filter(Boolean).join(" • ") || "Présence en exploration";
  const zones = [];
  if (data.niveau_engagement) zones.push(data.niveau_engagement);
  if (data.competences) zones.push(data.competences);
  const zonesText = zones.filter(Boolean).join(" • ") || "Zone d’expression à définir";
  const notes = data.motivation || data.construction || data.projet_existant || "—";
  const link = data.lien_unionmob || "Position à clarifier";
  return { name, unions, zones: zonesText, notes, link };
}

function collectFormData() {
  return Object.fromEntries(new FormData(form).entries());
}

function populateMembershipCard(data) {
  membershipCardData = buildMembershipCardPayload(data);
  if (membershipCardName) membershipCardName.textContent = membershipCardData.name;
  if (membershipCardUnions) membershipCardUnions.textContent = membershipCardData.unions;
  if (membershipCardZones) membershipCardZones.textContent = membershipCardData.zones;
  if (membershipCardLink) membershipCardLink.textContent = membershipCardData.link;
  if (membershipCardNotes) membershipCardNotes.textContent = membershipCardData.notes;
  membershipCard?.classList.remove("hidden");
  membershipCard?.classList.add("visible");
}

function showPresenceCard(data) {
  if (!membershipCard) return;
  populateMembershipCard(data);
}

window.showPresenceCard = showPresenceCard;

function hideMembershipCard(options = {}) {
  membershipCard?.classList.remove("visible");
  membershipCard?.classList.add("hidden");
  if (options.showSuccess) {
    success.hidden = false;
    successMessage.textContent = options.message || "Ta présence est notée, rien d’autre.";
  }
}

function downloadMembershipCard() {
  const cardElement = document.querySelector(".presence-card");
  if (!cardElement || !window.html2canvas) return;
  const scale = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
  html2canvas(cardElement, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#000",
    scale,
    ignoreElements: (el) => {
      if (!el) return false;
      if (el.tagName === "CANVAS") return true;
      if (el.getAttribute && el.getAttribute("data-engine") === "three.js") return true;
      if (el.dataset && el.dataset.engine === "three.js") return true;
      return false;
    }
  })
    .then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          window.alert("L’enregistrement n’a pas pu être généré. Réessaie dans un instant.");
          return;
        }
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "union-mob-carte.png";
        link.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      }, "image/png");
    })
    .catch(() => {
      window.alert("L’enregistrement n’a pas pu être généré sur ce navigateur. Essaie depuis un autre device ou plus tard.");
    });
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
  updatePronounFeedback();
  updateTransitionCopy();
});

updatePronounFeedback();

membershipDownload?.addEventListener("click", downloadMembershipCard);
membershipSend?.addEventListener("click", () => {
  hideMembershipCard({ showSuccess: true, message: "Ta présence est partagée." });
});
membershipClose?.addEventListener("click", () => {
  hideMembershipCard({ showSuccess: true });
});

previewCardBtn?.addEventListener("click", () => {
  const data = collectFormData();
  showPresenceCard(data);
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

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = collectFormData();
  showPresenceCard(data);
});

updateDynamicText();
showStep(currentStep);
visuals?.initUnionLabAnimation();
visuals?.startSplashSequence();
