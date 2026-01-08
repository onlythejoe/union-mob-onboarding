import { OnboardingController } from "./controllers/onboardingController.js";

const dom = {
  body: document.body,
  form: document.getElementById("unionForm"),
  previewCardBtn: document.getElementById("preview-card-btn"),
  successSection: document.getElementById("success"),
  steps: document.querySelectorAll(".step"),
  nextBtn: document.getElementById("nextBtn"),
  prevBtn: document.getElementById("prevBtn"),
  progressFill: document.querySelector(".progress-fill"),
  progressStatus: document.querySelector(".progress-status"),
  formContent: document.querySelector(".form-content"),
  transitionMessage: document.getElementById("transitionMessage"),
  finalReadyMessage: document.getElementById("finalReadyMessage"),
  successMessage: document.getElementById("successMessage"),
  pronounSelect: document.getElementById("pronom"),
  pronounFeedback: document.getElementById("pronoun-feedback"),
  membershipCard: document.getElementById("membership-card"),
  membershipCardName: document.querySelector("[data-card-name]"),
  membershipCardUnions: document.querySelector("[data-card-unions]"),
  membershipCardZones: document.querySelector("[data-card-zones]"),
  membershipCardLink: document.querySelector("[data-card-link]"),
  membershipCardNotes: document.querySelector("[data-card-notes]"),
  membershipDownload: document.getElementById("membership-download"),
  membershipSend: document.getElementById("membership-send"),
  membershipClose: document.getElementById("membership-close"),
  productionSlider: document.getElementById("production_level"),
  productionLevelValue: document.getElementById("productionLevelValue"),
  incarnationDetail: document.getElementById("incarnation-detail"),
  membershipAdjust: document.getElementById("membership-adjust"),
  membershipCardOrientationSummary: document.querySelector("[data-card-orientation-summary]"),
  membershipCardOrientationSecondary: document.querySelector("[data-card-orientation-secondary]")
};

const controller = new OnboardingController(dom);
controller.init();
