import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Helper to convert OKLCH color spaces to standard RGB format to bypass html2canvas parsing errors.
function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);
  return oklabToRgb(l, a_, b_, a);
}

function oklabToRgb(L: number, a_: number, b_: number, a: number = 1): string {
  // Convert OKLAB to LMS
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.2914855414 * b_;
  
  // LMS to linear sRGB
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  
  // Helper to convert linear sRGB to sRGB
  const toSRGB = (val: number) => {
    return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };
  
  const R = Math.max(0, Math.min(255, Math.round(toSRGB(r) * 255)));
  const G = Math.max(0, Math.min(255, Math.round(toSRGB(g) * 255)));
  const B = Math.max(0, Math.min(255, Math.round(toSRGB(b) * 255)));
  
  if (a < 1) {
    return `rgba(${R}, ${G}, ${B}, ${a})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
}

function replaceOklchWithRgb(cssText: string): string {
  return cssText.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
    try {
      const parts = p1.replace(/,/g, " ").replace(/\//g, " ").trim().split(/\s+/);
      if (parts.length < 3) return match;
      
      const lStr = parts[0];
      const cStr = parts[1];
      const hStr = parts[2];
      const aStr = parts.length >= 4 ? parts[3] : "1";
      
      let l = 0;
      if (lStr === "none") l = 0;
      else if (lStr.endsWith("%")) l = parseFloat(lStr) / 100;
      else l = parseFloat(lStr);
      
      let c = 0;
      if (cStr === "none") c = 0;
      else if (cStr.endsWith("%")) c = parseFloat(cStr) / 100;
      else c = parseFloat(cStr);
      
      let h = 0;
      if (hStr === "none") h = 0;
      else if (hStr.endsWith("deg")) h = parseFloat(hStr);
      else if (hStr.endsWith("rad")) h = (parseFloat(hStr) * 180) / Math.PI;
      else h = parseFloat(hStr);
      
      let a = 1;
      if (aStr === "none") a = 0;
      else if (aStr.endsWith("%")) a = parseFloat(aStr) / 100;
      else a = parseFloat(aStr);
      
      if (isNaN(l) || isNaN(c) || isNaN(h) || isNaN(a)) return match;
      
      return oklchToRgb(l, c, h, a);
    } catch (e) {
      return match;
    }
  });
}

function replaceOklabWithRgb(cssText: string): string {
  return cssText.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
    try {
      const parts = p1.replace(/,/g, " ").replace(/\//g, " ").trim().split(/\s+/);
      if (parts.length < 3) return match;
      
      const lStr = parts[0];
      const aStr = parts[1];
      const bStr = parts[2];
      const alphaStr = parts.length >= 4 ? parts[3] : "1";
      
      let l = 0;
      if (lStr === "none") l = 0;
      else if (lStr.endsWith("%")) l = parseFloat(lStr) / 100;
      else l = parseFloat(lStr);
      
      let a_ = 0;
      if (aStr === "none") a_ = 0;
      else if (aStr.endsWith("%")) a_ = (parseFloat(aStr) / 100) * 0.4;
      else a_ = parseFloat(aStr);
      
      let b_ = 0;
      if (bStr === "none") b_ = 0;
      else if (bStr.endsWith("%")) b_ = (parseFloat(bStr) / 100) * 0.4;
      else b_ = parseFloat(bStr);
      
      let alpha = 1;
      if (alphaStr === "none") alpha = 0;
      else if (alphaStr.endsWith("%")) alpha = parseFloat(alphaStr) / 100;
      else alpha = parseFloat(alphaStr);
      
      if (isNaN(l) || isNaN(a_) || isNaN(b_) || isNaN(alpha)) return match;
      
      return oklabToRgb(l, a_, b_, alpha);
    } catch (e) {
      return match;
    }
  });
}

function replaceColorsWithRgb(cssText: string): string {
  let text = replaceOklchWithRgb(cssText);
  text = replaceOklabWithRgb(text);
  return text;
}

export async function exportToPDF(
  elementId: string,
  filename: string,
  onProgress?: (status: "idle" | "generating" | "success" | "error") => void
) {
  const element = document.getElementById(elementId);
  if (!element) {
    if (onProgress) onProgress("error");
    return;
  }

  if (onProgress) onProgress("generating");

  try {
    // 1. Ensure fonts are fully loaded to prevent text/layout shifts
    await document.fonts.ready;

    // Determine size and format
    const hasClassStr = typeof element.className === "string";
    const isA4 = hasClassStr && element.className.includes("w-[210mm]");
    const pdfFormat = isA4 ? "a4" : "letter";

    // Standard widths and heights in points (pt) - 100% reliable
    const pdfWidth = isA4 ? 595.28 : 612;
    const pdfHeight = isA4 ? 841.89 : 792;

    // Compute px size of a page relative to element's actual layout width
    const elementWidth = element.scrollWidth > 0 ? element.scrollWidth : 816;
    const pageHeightPx = (pdfHeight * elementWidth) / pdfWidth;

    // Traverse the live DOM to find all elements with computed oklch/oklab colors
    const liveElements = Array.from(element.querySelectorAll("*")) as HTMLElement[];
    liveElements.push(element);

    const inlineStylePatches = new Map<number, Array<{ prop: string; rgbValue: string }>>();
    const colorProps = [
      "color",
      "background-color",
      "border-color",
      "border-top-color",
      "border-bottom-color",
      "border-left-color",
      "border-right-color",
      "outline-color",
      "fill",
      "stroke",
      "background-image"
    ];

    liveElements.forEach((el, index) => {
      const computed = window.getComputedStyle(el);
      const patches: Array<{ prop: string; rgbValue: string }> = [];
      
      for (const prop of colorProps) {
        const val = computed.getPropertyValue(prop);
        if (typeof val === "string" && (val.includes("oklch") || val.includes("oklab"))) {
          const rgb = replaceColorsWithRgb(val);
          if (!rgb.includes("NaN")) {
            patches.push({ prop, rgbValue: rgb });
          }
        }
      }
      
      if (patches.length > 0) {
        inlineStylePatches.set(index, patches);
      }
    });

    // Smart Layout Alignment for Pagination (Avoid half-cut elements across pages)
    const containerRect = element.getBoundingClientRect();
    const zoom = element.offsetWidth > 0 ? (containerRect.width / element.offsetWidth) : 1;

    // Selector list for all potential page break candidates (sections, experience entries, list items, headers, etc.)
    const candidateSelector = "h1, h2, h3, h4, h5, h6, p, li, img, .space-y-2 > div, .space-y-3 > div, .space-y-4 > div, .space-y-6 > div, .grid > div";
    const liveCandidates = Array.from(element.querySelectorAll(candidateSelector)) as HTMLElement[];

    // Uniquely mark elements with data-attributes for 100% reliable identification inside onclone
    liveCandidates.forEach((el, index) => {
      el.setAttribute("data-pdf-candidate-index", index.toString());
    });

    const candidatesWithBounds = liveCandidates.map((el, index) => {
      const rect = el.getBoundingClientRect();
      const top = (rect.top - containerRect.top) / zoom;
      const bottom = (rect.bottom - containerRect.top) / zoom;
      const height = rect.height / zoom;
      return { index, top, bottom, height };
    });

    // Sort strictly top-to-bottom. If top matches, sort by size descending (parents before children)
    candidatesWithBounds.sort((a, b) => (a.top - b.top) || (b.height - a.height));

    const shiftsToApply = new Map<number, number>(); // candidateIndex -> shiftPx
    let accumulatedShift = 0;

    for (const item of candidatesWithBounds) {
      const currentTop = item.top + accumulatedShift;
      const currentBottom = item.bottom + accumulatedShift;

      // Skip elements that are simply too large to fit on a single page anyway
      if (item.height >= pageHeightPx) {
        continue;
      }

      const pageOfTop = Math.floor(currentTop / pageHeightPx);
      const pageOfBottom = Math.floor(currentBottom / pageHeightPx);

      // If it crosses a page boundary
      if (pageOfTop !== pageOfBottom) {
        const nextPageTop = pageOfBottom * pageHeightPx;
        const neededShift = nextPageTop - currentTop;

        if (neededShift > 0 && neededShift < pageHeightPx) {
          shiftsToApply.set(item.index, neededShift);
          accumulatedShift += neededShift;
        }
      }
    }

    // Pre-load remote images as base64 map to bypass CORS canvas taint errors
    const base64Images = new Map<string, string>();
    const images = Array.from(element.querySelectorAll("img"));
    for (const img of images) {
      if (img.src && !img.src.startsWith("data:") && !img.src.startsWith(window.location.origin)) {
        try {
          const res = await fetch(img.src, { mode: "cors" });
          if (res.ok) {
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            base64Images.set(img.src, base64);
          }
        } catch (err) {
          console.warn(`Failed to preload image CORS-safely: ${img.src}`, err);
        }
      }
    }

    // Preload stylesheets
    const cssPreloads = new Map<string, string>();
    const linkElements = Array.from(document.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
    for (const link of linkElements) {
      if (link.href && link.href.startsWith(window.location.origin)) {
        try {
          const response = await fetch(link.href);
          const cssText = await response.text();
          cssPreloads.set(link.href, replaceColorsWithRgb(cssText));
        } catch (err) {
          console.warn("Could not preload stylesheet for color replacement:", err);
        }
      }
    }

    // 4. Capture the canvas with high resolution scale
    const canvas = await html2canvas(element, {
      scale: 2.5, // Higher scale for ultra-crisp print text
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0, // CRITICAL: forces capture from coordinate (0,0) so scrolled state never produces blank white canvas!
      onclone: (clonedDoc) => {
        // Find the cloned element in the iframe document
        const clonedElement = clonedDoc.getElementById(elementId) as HTMLElement;
        if (!clonedElement) return;

        // Force standard light mode on cloned document for traditional light background print
        clonedDoc.documentElement.classList.remove("dark");
        clonedDoc.body.classList.remove("dark");
        clonedElement.classList.remove("dark");

        // Force scale exactly to 1.0 and disable transitions on the cloned target
        clonedElement.style.transform = "none";
        clonedElement.style.transformOrigin = "top center";
        clonedElement.style.transition = "none";
        clonedElement.classList.remove("transition-all");

        // Apply preloaded stylesheets as styles, disabling original links
        const clonedLinks = Array.from(clonedDoc.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
        for (const clonedLink of clonedLinks) {
          if (clonedLink.href && cssPreloads.has(clonedLink.href)) {
            const styleEl = clonedDoc.createElement("style");
            styleEl.textContent = cssPreloads.get(clonedLink.href)!;
            clonedLink.parentNode?.insertBefore(styleEl, clonedLink);
            clonedLink.disabled = true;
          }
        }

        // Convert <style> blocks in iframe
        const clonedStyles = Array.from(clonedDoc.querySelectorAll("style"));
        for (const styleEl of clonedStyles) {
          if (styleEl.textContent && (styleEl.textContent.includes("oklch") || styleEl.textContent.includes("oklab"))) {
            styleEl.textContent = replaceColorsWithRgb(styleEl.textContent);
          }
        }

        // Apply oklch computed patches to cloned elements
        const clonedElements = Array.from(clonedElement.querySelectorAll("*")) as HTMLElement[];
        clonedElements.push(clonedElement);

        for (const [index, patches] of inlineStylePatches.entries()) {
          const clonedEl = clonedElements[index];
          if (clonedEl) {
            for (const patch of patches) {
              clonedEl.style.setProperty(patch.prop, patch.rgbValue);
            }
          }
        }

        // Apply pagination margin shifts to cloned candidate elements using marked data-attributes
        for (const [index, shift] of shiftsToApply.entries()) {
          const clonedEl = clonedElement.querySelector(`[data-pdf-candidate-index="${index}"]`) as HTMLElement;
          if (clonedEl) {
            const computedMarginTop = parseFloat(window.getComputedStyle(clonedEl).getPropertyValue("margin-top")) || 0;
            clonedEl.style.setProperty("margin-top", `${computedMarginTop + shift}px`, "important");
          }
        }

        // Replace remote images with preloaded base64 sources
        const clonedImages = Array.from(clonedElement.querySelectorAll("img"));
        for (const clonedImg of clonedImages) {
          if (base64Images.has(clonedImg.src)) {
            clonedImg.src = base64Images.get(clonedImg.src)!;
          }
        }

        // Deep-scan vector fills & strokes
        const allElements = clonedDoc.getElementsByTagName("*");
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i] as HTMLElement;
          const fill = el.getAttribute("fill");
          if (fill && (fill.includes("oklch") || fill.includes("oklab"))) {
            el.setAttribute("fill", replaceColorsWithRgb(fill));
          }
          const stroke = el.getAttribute("stroke");
          if (stroke && (stroke.includes("oklch") || stroke.includes("oklab"))) {
            el.setAttribute("stroke", replaceColorsWithRgb(stroke));
          }
          const styleAttr = el.getAttribute("style");
          if (styleAttr && (styleAttr.includes("oklch") || styleAttr.includes("oklab"))) {
            el.setAttribute("style", replaceColorsWithRgb(styleAttr));
          }
        }
      }
    });

    const canvasWidth = canvas.width > 0 ? canvas.width : 1;
    const canvasHeight = canvas.height > 0 ? canvas.height : 1;

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: pdfFormat,
    });

    // Compute dimensions in points (pt)
    const imgWidth = pdfWidth;
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

    if (isNaN(imgWidth) || isNaN(imgHeight) || !isFinite(imgWidth) || !isFinite(imgHeight)) {
      throw new Error(`Invalid PDF image dimensions calculated: imgWidth=${imgWidth}, imgHeight=${imgHeight}`);
    }

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;

    // Manage multiple pages if necessary
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;
    }

    // Save PDF
    pdf.save(filename);
    if (onProgress) onProgress("success");
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (onProgress) onProgress("error");
  } finally {
    // Clean up temporary data attributes from live elements
    try {
      const marked = element.querySelectorAll("[data-pdf-candidate-index]");
      marked.forEach((el) => el.removeAttribute("data-pdf-candidate-index"));
    } catch (err) {
      console.warn("Failed to clean up data-pdf-candidate-index attributes:", err);
    }
  }
}
