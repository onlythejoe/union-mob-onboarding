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
  iel: {
    transitionSuffix: "On est avec toi.",
    closing: "L’espace est ouvert pour toi.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  },
  default: {
    transitionSuffix: "",
    closing: "L’espace est ouvert.",
    thanks: "Merci, ton profil rejoint l’écosystème."
  }
};

export const DEFAULT_PRONOUN_KEY = "default";

export function getPronounText(key) {
  return pronounMap[key] || pronounMap[DEFAULT_PRONOUN_KEY];
}
