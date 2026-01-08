import { getPronounText } from "../config/pronounConfig.js";

const transitionCopyMap = {
  2: "La base est posée.",
  3: "On affine ton lien au collectif.",
  4: "On trace tes zones d’expression.",
  5: "On dévoile tes talents.",
  6: "Tu précises ta motivation.",
  7: "Ton parcours est complet."
};

export function buildTransitionCopy({ currentStep, totalSteps, hasProgressed, userPronoun }) {
  if (!hasProgressed && currentStep === 1) {
    return "Tu es ici.";
  }

  const pronounText = getPronounText(userPronoun);
  const baseText =
    transitionCopyMap[currentStep] ||
    `Tu avances vite — étape ${currentStep} / ${totalSteps}.`;
  const suffix = pronounText.transitionSuffix ? ` ${pronounText.transitionSuffix}` : "";
  return `${baseText}${suffix}`;
}

export function updateDynamicText({ userPronoun, finalReadyMessage, successMessage }) {
  const pronounText = getPronounText(userPronoun);
  if (finalReadyMessage) finalReadyMessage.textContent = pronounText.closing;
  if (successMessage) successMessage.textContent = pronounText.thanks;
}
