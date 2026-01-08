export class StepManager {
  constructor({
    steps,
    form,
    nextBtn,
    prevBtn,
    previewCardBtn,
    progressFill,
    progressStatus,
    formContent,
    body,
    onStepChange
  }) {
    this.steps = Array.isArray(steps) ? steps : [];
    this.form = form;
    this.nextBtn = nextBtn;
    this.prevBtn = prevBtn;
    this.previewCardBtn = previewCardBtn;
    this.progressFill = progressFill;
    this.progressStatus = progressStatus;
    this.formContent = formContent;
    this.body = body;
    this.onStepChange = onStepChange;
    this.currentStep = 1;
    this.totalSteps = this.steps.length;
    this.hasProgressed = false;
  }

  init() {
    this.showStep(this.currentStep);
  }

  showStep(step) {
    const safeStep = Math.min(Math.max(step, 1), this.totalSteps);
    this.currentStep = safeStep;
    this.steps.forEach((element, index) => {
      const isActive = index === safeStep - 1;
      element.classList.toggle("active", isActive);
      element.setAttribute("aria-hidden", String(!isActive));
    });

    if (this.prevBtn) this.prevBtn.hidden = safeStep === 1;
    if (this.nextBtn) this.nextBtn.hidden = safeStep === this.totalSteps;
    if (this.previewCardBtn) this.previewCardBtn.hidden = safeStep !== this.totalSteps;
    if (this.nextBtn) {
      this.nextBtn.textContent = safeStep === 1 ? "Commencer" : "Suivant";
    }

    this.updateProgress();
    this.updateNextState();
    this.resetScrollPosition();

    if (safeStep > 1) {
      this.hasProgressed = true;
    }

    if (typeof this.onStepChange === "function") {
      this.onStepChange({
        currentStep: this.currentStep,
        totalSteps: this.totalSteps,
        hasProgressed: this.hasProgressed
      });
    }
  }

  updateProgress() {
    if (!this.progressFill || !this.progressStatus) return;
    const percent =
      this.totalSteps > 1 ? ((this.currentStep - 1) / (this.totalSteps - 1)) * 100 : 100;
    this.progressFill.style.width = `${percent}%`;
    this.progressStatus.textContent = `Étape ${this.currentStep} / ${this.totalSteps}`;
  }

  updateNextState() {
    if (!this.nextBtn) return;
    if (this.currentStep === this.totalSteps) {
      this.nextBtn.disabled = false;
      return;
    }

    const activeStep = this.steps[this.currentStep - 1];
    const requiredFields = activeStep?.querySelectorAll("input[required], select[required], textarea[required]");
    if (!requiredFields?.length) {
      this.nextBtn.disabled = false;
      return;
    }

    const allValid = Array.from(requiredFields).every((field) => field.value.trim() !== "");
    this.nextBtn.disabled = !allValid;
  }

  resetScrollPosition() {
    if (this.body?.classList.contains("splash-active")) return;
    if (this.formContent) {
      this.formContent.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    if (window.scrollY > 16) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }

  handleFormEvent(event) {
    if (!event.target?.closest) return;
    const activeStep = this.steps[this.currentStep - 1];
    if (activeStep && event.target.closest(".step.active")) {
      this.updateNextState();
    }
  }
}
