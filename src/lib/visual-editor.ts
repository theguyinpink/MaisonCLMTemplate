type ProjectFile = {
  id: string;
  path: string;
  content: string | null;
};

export type VisualSelection = {
  tag: string;
  text: string;
  html: string;
  id: string | null;
  className: string;
  selector: string;
  href?: string | null;
  src?: string | null;
  computed?: {
    color?: string;
    backgroundColor?: string;
  };
};

function findFile(files: ProjectFile[], ...possiblePaths: string[]) {
  const lower = possiblePaths.map((p) => p.toLowerCase());

  return (
    files.find((file) => lower.includes(file.path.toLowerCase())) ?? null
  );
}

export function findHtmlFile(files: ProjectFile[]) {
  return (
    findFile(files, "index.html") ??
    files.find((f) => f.path.toLowerCase().endsWith(".html")) ??
    null
  );
}

function removeExternalLinksFromHtml(html: string) {
  return html
    .replace(/<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi, "")
    .replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi, "");
}

function extractBodyContent(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (match?.[1]) return match[1];
  return html;
}

function buildSelectionScript() {
  return `
(function () {
  let currentOverlay = null;

  function removeOverlay() {
    if (currentOverlay) {
      currentOverlay.remove();
      currentOverlay = null;
    }
  }

  function createOverlay(rect) {
    removeOverlay();
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.left = rect.left + "px";
    overlay.style.top = rect.top + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
    overlay.style.border = "2px solid #d86aa2";
    overlay.style.background = "rgba(216,106,162,0.08)";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "999999";
    overlay.style.borderRadius = "8px";
    document.body.appendChild(overlay);
    currentOverlay = overlay;
  }

  function getElementSelector(el) {
    if (el.id) return "#" + el.id;

    if (el.dataset && el.dataset.clmId) {
      return '[data-clm-id="' + el.dataset.clmId + '"]';
    }

    let path = [];
    let current = el;

    while (current && current.nodeType === 1 && current.tagName.toLowerCase() !== "html") {
      let selector = current.tagName.toLowerCase();

      if (current.classList.length > 0) {
        selector += "." + Array.from(current.classList).slice(0, 2).join(".");
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.tagName === current.tagName
        );
        if (siblings.length > 1) {
          selector += ":nth-of-type(" + (siblings.indexOf(current) + 1) + ")";
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(" > ");
  }

  function getComputedStyles(el) {
    const styles = window.getComputedStyle(el);
    return {
      color: styles.color || "",
      backgroundColor: styles.backgroundColor || "",
    };
  }

  document.addEventListener("mouseover", function (e) {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    createOverlay(rect);
  });

  document.addEventListener("mouseout", function () {
    removeOverlay();
  });

  document.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    const payload = {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || "").trim().slice(0, 500),
      html: el.outerHTML.slice(0, 2000),
      id: el.id || null,
      className: el.className || "",
      selector: getElementSelector(el),
      href: el.getAttribute("href"),
      src: el.getAttribute("src"),
      computed: getComputedStyles(el),
    };

    window.parent.postMessage(
      { type: "clm-preview-select", payload },
      "*"
    );
  }, true);
})();
  `.trim();
}

export function buildPreviewDocument(files: ProjectFile[]) {
  const htmlFile = findHtmlFile(files);

  const cssFile =
    findFile(files, "style.css", "styles/style.css") ??
    files.find((f) => f.path.toLowerCase().endsWith(".css")) ??
    null;

  const jsFile =
    findFile(files, "main.js", "scripts/main.js") ??
    files.find((f) => f.path.toLowerCase().endsWith(".js")) ??
    null;

  const rawHtml =
    htmlFile?.content ??
    `<!DOCTYPE html><html><head><title>Aperçu</title></head><body><p>Aucun index.html trouvé.</p></body></html>`;

  const cleanHtml = removeExternalLinksFromHtml(rawHtml);
  const css = cssFile?.content ?? "";
  const js = jsFile?.content ?? "";

  return {
    htmlPath: htmlFile?.path ?? null,
    cssPath: cssFile?.path ?? null,
    jsPath: jsFile?.path ?? null,
    srcDoc: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
${css}
  </style>
</head>
<body>
${extractBodyContent(cleanHtml)}
<script>
${buildSelectionScript()}
</script>
<script>
${js}
</script>
</body>
</html>`.trim(),
  };
}

function withDoctype(doc: Document) {
  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

function parseHtml(html: string) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

function safeQuery(doc: Document, selector: string) {
  try {
    return doc.querySelector(selector);
  } catch {
    return null;
  }
}

export function updateSelectedElementText(
  html: string,
  selector: string,
  text: string
) {
  const doc = parseHtml(html);
  const el = safeQuery(doc, selector);

  if (!el) return html;

  el.textContent = text;
  return withDoctype(doc);
}

export function updateSelectedElementStyle(
  html: string,
  selector: string,
  property: "color" | "backgroundColor",
  value: string
) {
  const doc = parseHtml(html);
  const el = safeQuery(doc, selector);

  if (!el || !(el instanceof HTMLElement)) return html;

  if (property === "color") {
    el.style.color = value;
  }

  if (property === "backgroundColor") {
    el.style.backgroundColor = value;
  }

  return withDoctype(doc);
}

export function updateSelectedElementImage(
  html: string,
  selector: string,
  imageUrl: string
) {
  const doc = parseHtml(html);
  const el = safeQuery(doc, selector);

  if (!el) return html;

  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) return html;

  if (el.tagName.toLowerCase() === "img" && el instanceof HTMLImageElement) {
    el.src = cleanUrl;

    if (!el.alt || !el.alt.trim()) {
      el.alt = "Image";
    }

    return withDoctype(doc);
  }

  if (el instanceof HTMLElement) {
    el.style.backgroundImage = `url("${cleanUrl}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";

    const textNodes = Array.from(el.querySelectorAll("span, p"));
    textNodes.forEach((node) => {
      if ((node.textContent || "").toLowerCase().includes("image ici")) {
        node.remove();
      }
    });

    el.setAttribute("data-clm-filled-image", "true");
  }

  return withDoctype(doc);
}

export function updateFilesHtmlContent(
  files: ProjectFile[],
  newHtml: string
): ProjectFile[] {
  const htmlFile = findHtmlFile(files);
  if (!htmlFile) return files;

  return files.map((file) =>
    file.id === htmlFile.id
      ? {
          ...file,
          content: newHtml,
        }
      : file
  );
}

export function canEditText(tag: string) {
  return ["h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "button", "span", "label", "li"].includes(tag);
}

export function canEditImage(selection: VisualSelection | null) {
  if (!selection) return false;

  if (selection.tag === "img") return true;

  const html = selection.html.toLowerCase();
  const className = (selection.className || "").toLowerCase();

  return (
    className.includes("image-placeholder") ||
    html.includes("image-placeholder") ||
    html.includes("image ici")
  );
}