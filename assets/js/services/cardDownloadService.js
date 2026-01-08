export function downloadMembershipCard(cardSelector = ".presence-card") {
  const cardElement = document.querySelector(cardSelector);
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
      window.alert(
        "L’enregistrement n’a pas pu être généré sur ce navigateur. Essaie depuis un autre device ou plus tard."
      );
    });
}
