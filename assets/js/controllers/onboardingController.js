import { StepManager } from "../services/stepManager.js";
import { collectFormData } from "../services/formService.js";
import { buildTransitionCopy, updateDynamicText } from "../services/transitionService.js";
import { showMembershipCard, hideMembershipCard } from "../services/membershipCardService.js";
import { downloadMembershipCard } from "../services/cardDownloadService.js";
import { setupViewportHeight } from "../services/viewportService.js";
import { setupUnionLogoAnimation } from "../logoAnimator.js";
import { computeOrientation } from "../services/orientationService.js";

export class OnboardingController {
  constructor(dom) {
    this.body = dom.body;
    this.form = dom.form;
    this.previewCardBtn = dom.previewCardBtn;
    this.transitions = {
      transitionMessage: dom.transitionMessage,
      finalReadyMessage: dom.finalReadyMessage,
      successMessage: dom.successMessage,
      pronounFeedback: dom.pronounFeedback
    };
    this.successSection = dom.successSection;
    this.membershipNodes = {
      membershipCard: dom.membershipCard,
      membershipCardName: dom.membershipCardName,
      membershipCardUnions: dom.membershipCardUnions,
      membershipCardZones: dom.membershipCardZones,
      membershipCardLink: dom.membershipCardLink,
      membershipCardNotes: dom.membershipCardNotes,
      membershipCardOrientationPrimary: dom.membershipCardOrientationPrimary,
      membershipCardOrientationSecondaryBadge: dom.membershipCardOrientationSecondaryBadge,
      membershipCardOrientationHybrid: dom.membershipCardOrientationHybrid
    };
    this.membershipNodes.membershipCardOrientationSummary =
      dom.membershipCardOrientationSummary;
    this.membershipNodes.membershipCardOrientationSecondary =
      dom.membershipCardOrientationSecondary;
    this.buttons = {
      membershipDownload: dom.membershipDownload,
      membershipSend: dom.membershipSend,
      membershipClose: dom.membershipClose,
      membershipAdjust: dom.membershipAdjust
    };
    this.productionSlider = dom.productionSlider;
    this.productionLevelValue = dom.productionLevelValue;
    this.incarnationDetail = dom.incarnationDetail;
    this.pronounSelect = dom.pronounSelect;
    this.orientationLiveElements = Array.from(dom.orientationLiveElements || []);

    this.stepManager = new StepManager({
      steps: Array.from(dom.steps),
      form: this.form,
      nextBtn: dom.nextBtn,
      prevBtn: dom.prevBtn,
      previewCardBtn: this.previewCardBtn,
      progressFill: dom.progressFill,
      progressStatus: dom.progressStatus,
      formContent: dom.formContent,
      body: this.body,
      onStepChange: this.handleStepChange.bind(this)
    });

    this.userPronoun = dom.pronounSelect?.value || "default";
    this.viewportCleanup = null;
  }

  init() {
    this.viewportCleanup = setupViewportHeight();
    this.stepManager.init();
    this.updateProductionLevelValue(this.productionSlider?.value ?? "2");
    this.toggleIncarnationDetail();
    this.updateOrientationLive();
    this.updatePronounFeedback();
    updateDynamicText({
      userPronoun: this.userPronoun,
      finalReadyMessage: this.transitions.finalReadyMessage,
      successMessage: this.transitions.successMessage
    });
    this.attachEventListeners();
    this.renderTransitionCopy();
    this.attachWindowExports();
    this.initVisuals();
    setupUnionLogoAnimation();
  }

  attachEventListeners() {
    if (this.buttons.membershipDownload) {
      this.buttons.membershipDownload.addEventListener("click", () => {
        downloadMembershipCard();
      });
    }

    this.buttons.membershipSend?.addEventListener("click", () => {
      hideMembershipCard({
        membershipCard: this.membershipNodes.membershipCard,
        successSection: this.successSection,
        successMessage: this.transitions.successMessage,
        options: { showSuccess: true, message: "Ta présence est partagée." }
      });
    });

    this.buttons.membershipClose?.addEventListener("click", () => {
      hideMembershipCard({
        membershipCard: this.membershipNodes.membershipCard,
        successSection: this.successSection,
        successMessage: this.transitions.successMessage,
        options: { showSuccess: true }
      });
    });

    this.buttons.membershipAdjust?.addEventListener("click", () => {
      hideMembershipCard({
        membershipCard: this.membershipNodes.membershipCard
      });
      this.stepManager.showStep(4);
    });

    this.previewCardBtn?.addEventListener("click", () => {
      const data = collectFormData(this.form);
      if (!data) return;
      showMembershipCard(data, this.membershipNodes);
    });

    this.stepManager.nextBtn?.addEventListener("click", () => {
      if (this.stepManager.nextBtn.disabled) return;
      if (this.stepManager.currentStep >= this.stepManager.totalSteps) return;
      this.stepManager.showStep(this.stepManager.currentStep + 1);
    });

    this.stepManager.prevBtn?.addEventListener("click", () => {
      if (this.stepManager.currentStep <= 1) return;
      this.stepManager.showStep(this.stepManager.currentStep - 1);
    });

    this.form?.addEventListener("input", (event) => {
      this.stepManager.handleFormEvent(event);
      this.updateConditionalFields(event);
      this.updateOrientationLive();
    });

    this.form?.addEventListener("change", (event) => {
      this.stepManager.handleFormEvent(event);
      this.updateConditionalFields(event);
      this.updateOrientationLive();
    });

    this.form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = collectFormData(this.form);
      if (!data) return;
      showMembershipCard(data, this.membershipNodes);
    });

    this.pronounSelect?.addEventListener("change", (event) => {
      this.userPronoun = event.target.value || "default";
      updateDynamicText({
        userPronoun: this.userPronoun,
        finalReadyMessage: this.transitions.finalReadyMessage,
        successMessage: this.transitions.successMessage
      });
      this.updatePronounFeedback();
      this.renderTransitionCopy();
    });
  }

  handleStepChange({ currentStep, totalSteps, hasProgressed }) {
    if (!this.transitions.transitionMessage) return;
    const copy = buildTransitionCopy({
      currentStep,
      totalSteps,
      hasProgressed,
      userPronoun: this.userPronoun
    });
    this.transitions.transitionMessage.textContent = copy;
  }

  renderTransitionCopy() {
    this.handleStepChange({
      currentStep: this.stepManager.currentStep,
      totalSteps: this.stepManager.totalSteps,
      hasProgressed: this.stepManager.hasProgressed
    });
  }

  updatePronounFeedback() {
    if (!this.transitions.pronounFeedback) return;
    if (this.pronounSelect?.value) {
      this.transitions.pronounFeedback.textContent =
        "On t’adresse selon ce pronom pour rester aligné·e.";
      return;
    }
    this.transitions.pronounFeedback.textContent =
      "Ton langage neutre reste privilégié tant que tu ne précises rien.";
  }

  updateOrientationLive() {
    if (!this.orientationLiveElements.length || !this.form) return;
    const formValues = Object.fromEntries(new FormData(this.form).entries());
    const orientation = computeOrientation(formValues);
    const label =
      orientation.orientation_suggeree || "en cours d’observation";
    this.orientationLiveElements.forEach((element) => {
      element.textContent = label;
      const container = element.closest(".orientation-live");
      if (!container) return;
      container.classList.add("updating");
      window.requestAnimationFrame(() => container.classList.remove("updating"));
    });
  }

  updateConditionalFields(event) {
    if (!event?.target) return;
    if (event.target === this.productionSlider) {
      this.updateProductionLevelValue(event.target.value);
    }
    if (event.target.name === "incarnation_public") {
      this.toggleIncarnationDetail();
    }
  }

  updateProductionLevelValue(value) {
    if (!this.productionLevelValue) return;
    this.productionLevelValue.textContent = value ?? "0";
  }

  toggleIncarnationDetail() {
    if (!this.incarnationDetail) return;
    const selected = document.querySelector('input[name="incarnation_public"]:checked');
    const showDetail = selected?.value === "oui";
    this.incarnationDetail.classList.toggle("hidden", !showDetail);
  }

  attachWindowExports() {
    window.showPresenceCard = (formValues) => {
      if (!formValues) return;
      showMembershipCard(formValues, this.membershipNodes);
    };
  }

  initVisuals() {
    const visuals =
      typeof setupVisualManager === "function"
        ? setupVisualManager({
            body: this.body,
            eaSplash: document.getElementById("ea-splash"),
            unionLabBackground: document.getElementById("background-union-lab"),
            unionLabCanvas: document.getElementById("background-union-lab"),
            eaLogo: document.getElementById("ea-logo"),
            appOnboarding: document.getElementById("app-onboarding"),
            onSplashFinish: () => {
              this.stepManager.showStep(this.stepManager.currentStep);
            }
          })
        : null;

    visuals?.initUnionLabAnimation();
    visuals?.startSplashSequence();
  }

  destroy() {
    if (typeof this.viewportCleanup === "function") {
      this.viewportCleanup();
    }
  }
}
