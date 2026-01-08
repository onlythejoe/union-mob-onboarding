const DEFAULT_LOGO_SELECTOR = "#logo-union-mob";
const LOGO_ASSET = new URL("../UM_Logo.svg", import.meta.url).href;

export async function setupUnionLogoAnimation(options = {}) {
  const selector = options.selector || DEFAULT_LOGO_SELECTOR;
  const placeholder = document.querySelector(selector);
  if (!placeholder) return;

  try {
    const response = await fetch(LOGO_ASSET, { cache: "force-cache" });
    if (!response.ok) {
      console.error("[UM] Unable to load logo SVG for animation:", response.statusText);
      return;
    }

    const svgText = await response.text();
    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = documentFragment.querySelector("svg");
    if (!svgElement) {
      console.error("[UM] Fetched logo SVG is malformed.");
      return;
    }

    if (placeholder.id) {
      svgElement.id = placeholder.id;
    }

    const altCopy = placeholder.getAttribute("alt") || "Union Mob logo";
    svgElement.setAttribute("role", "img");
    svgElement.setAttribute("aria-label", altCopy);
    svgElement.setAttribute("focusable", "false");
    svgElement.dataset.inlineLogo = "true";

    placeholder.replaceWith(svgElement);
  } catch (error) {
    console.error("[UM] Logo animation inline failed:", error);
  }
}

/*
 * Inlining the SVG here keeps the asset free of animation concerns while letting the
 * UI layer (CSS + JS) orchestrate hover states, filters and accessibility attributes.
 */
