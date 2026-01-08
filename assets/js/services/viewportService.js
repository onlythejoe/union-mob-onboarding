function setVh() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}

export function setupViewportHeight() {
  setVh();
  window.addEventListener("resize", setVh);
  window.addEventListener("orientationchange", setVh);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setVh);
  }

  return () => {
    window.removeEventListener("resize", setVh);
    window.removeEventListener("orientationchange", setVh);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", setVh);
    }
  };
}
