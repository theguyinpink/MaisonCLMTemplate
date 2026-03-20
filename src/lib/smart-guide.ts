export type SmartGuideResult = {
  title: string;
  contextLabel: string;
  role: string;
  editable: string;
  caution?: string;
  detectedType: string;
  snippet: string;
  examples?: string[];
};

function getExtension(path: string) {
  const clean = (path || "").split("?")[0].split("#")[0].trim().toLowerCase();
  const parts = clean.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function getLanguageFromPath(path: string) {
  const ext = getExtension(path);

  switch (ext) {
    case "html":
      return "html";
    case "css":
      return "css";
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "tsx";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "text";
  }
}

function getLines(content: string) {
  return content.split("\n");
}

function getSafeLine(lines: string[], index: number) {
  return lines[index] ?? "";
}

function extractSnippet(lines: string[], lineNumber: number, radius = 6) {
  const start = Math.max(0, lineNumber - 1 - radius);
  const end = Math.min(lines.length, lineNumber - 1 + radius + 1);
  return lines.slice(start, end).join("\n");
}

function findNearestMatch(
  lines: string[],
  lineIndex: number,
  patterns: RegExp[],
  searchRadius = 16
) {
  const start = Math.max(0, lineIndex - searchRadius);
  const end = Math.min(lines.length - 1, lineIndex + searchRadius);

  for (let i = lineIndex; i >= start; i--) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        return lines[i].trim();
      }
    }
  }

  for (let i = lineIndex + 1; i <= end; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        return lines[i].trim();
      }
    }
  }

  return null;
}

function detectSemanticSection(snippet: string) {
  const s = snippet.toLowerCase();

  if (s.includes("hero") || s.includes('id="home"') || s.includes("hero-content")) {
    return "Section hero";
  }

  if (s.includes("navbar") || s.includes("nav-links") || s.includes("navtoggle")) {
    return "Navigation";
  }

  if (s.includes("booking") || s.includes("bookingform") || s.includes("reservation")) {
    return "Réservation";
  }

  if (s.includes("gallery")) {
    return "Galerie";
  }

  if (s.includes("footer") || s.includes("contact")) {
    return "Pied de page";
  }

  if (s.includes("menu")) {
    return "Menu / carte";
  }

  if (s.includes("testimonial")) {
    return "Avis clients";
  }

  if (s.includes("about")) {
    return "Section à propos";
  }

  return "Bloc courant";
}

function detectHtmlContext(
  line: string,
  snippet: string
): Omit<SmartGuideResult, "snippet"> {
  const trimmed = line.trim();
  const contextLabel = detectSemanticSection(snippet);

  if (trimmed.includes("<h1")) {
    return {
      title: "Titre principal",
      contextLabel,
      role: "C’est le grand titre visible dans cette partie de la page. C’est souvent le premier texte que le visiteur lit.",
      editable: "Tu peux modifier ce texte pour changer le message principal du site.",
      caution: "Essaie de garder une phrase assez courte pour éviter qu’elle prenne trop de place.",
      detectedType: "html:h1",
      examples: [
        "<h1>Une expérience gourmande dans un lieu élégant</h1>",
        "<h1>Le restaurant idéal pour vos moments entre proches</h1>",
      ],
    };
  }

  if (trimmed.includes("<h2")) {
    return {
      title: "Titre de section",
      contextLabel,
      role: "Ce texte sert à introduire une partie importante de la page.",
      editable: "Tu peux le changer pour mieux nommer cette section.",
      caution: "Garde un titre simple et clair.",
      detectedType: "html:h2",
      examples: [
        "<h2>Notre carte</h2>",
        "<h2>Réservez votre table</h2>",
      ],
    };
  }

  if (trimmed.includes("<p")) {
    return {
      title: "Texte descriptif",
      contextLabel,
      role: "Ce texte sert à expliquer, présenter ou rassurer le visiteur.",
      editable: "Tu peux réécrire ce paragraphe pour adapter le contenu au client.",
      caution: "Essaie de garder un texte lisible, pas trop long.",
      detectedType: "html:paragraph",
      examples: [
        "<p>Découvrez une cuisine généreuse et un cadre chaleureux.</p>",
        "<p>Un lieu pensé pour partager un vrai bon moment.</p>",
      ],
    };
  }

  if (trimmed.includes("<a") && trimmed.includes("btn")) {
    return {
      title: "Bouton d’action",
      contextLabel,
      role: "Ce lien est affiché comme un bouton pour inciter le visiteur à cliquer.",
      editable: "Tu peux changer le texte du bouton et parfois sa destination.",
      caution: "Si tu modifies le lien, vérifie que la destination est toujours correcte.",
      detectedType: "html:button-link",
      examples: [
        '<a href="#booking" class="btn btn-primary">Réserver une table</a>',
        '<a href="#menu" class="btn btn-secondary">Voir le menu</a>',
      ],
    };
  }

  if (trimmed.includes("<form")) {
    return {
      title: "Formulaire",
      contextLabel,
      role: "Ce bloc regroupe les champs que le visiteur remplit pour envoyer une demande.",
      editable: "Tu peux modifier les textes visibles autour du formulaire.",
      caution: "Évite de supprimer les champs ou les identifiants sans vérifier le script JavaScript.",
      detectedType: "html:form",
      examples: [
        '<form class="booking-form" id="bookingForm">',
      ],
    };
  }

  if (
    trimmed.includes("<input") ||
    trimmed.includes("<textarea") ||
    trimmed.includes("<select")
  ) {
    return {
      title: "Champ de formulaire",
      contextLabel,
      role: "Ce champ permet au visiteur de saisir une information.",
      editable: "Tu peux modifier le placeholder, le label ou certaines options visibles.",
      caution: "Évite de changer les id ou name si le JavaScript les utilise.",
      detectedType: "html:field",
      examples: [
        '<input type="email" id="email" name="email" placeholder="Votre email" required />',
        '<textarea id="message" name="message" rows="4"></textarea>',
      ],
    };
  }

  if (trimmed.includes("<section")) {
    return {
      title: "Section de page",
      contextLabel,
      role: "Cette balise délimite une grande zone de la page, comme une présentation, une galerie ou un formulaire.",
      editable: "Tu peux modifier ce qu’il y a à l’intérieur de cette section.",
      caution: "Ne supprime pas cette structure si elle est utilisée pour le style ou la navigation.",
      detectedType: "html:section",
      examples: [
        '<section class="gallery section" id="gallery">',
      ],
    };
  }

  return {
    title: "Bloc HTML",
    contextLabel,
    role: "Ce morceau de code fait partie de la structure visible de la page.",
    editable: "Tu peux modifier son contenu selon ce que tu veux afficher.",
    caution: "Fais attention à garder un HTML propre, avec des balises bien fermées.",
    detectedType: "html:generic",
    examples: [
      "<div>Contenu</div>",
    ],
  };
}

function detectCssContext(
  line: string,
  snippet: string,
  selectorLine: string | null
): Omit<SmartGuideResult, "snippet"> {
  const trimmed = line.trim();
  const contextLabel = detectSemanticSection(`${selectorLine ?? ""}\n${snippet}`);

  if (selectorLine?.startsWith("a")) {
    return {
      title: "Liens du site",
      contextLabel,
      role: "Ces styles définissent l’apparence de tous les liens cliquables du site.",
      editable: "Tu peux changer leur couleur ou remettre un soulignement si tu veux les rendre plus visibles.",
      caution: "Tu peux tester sans risque : ici tu modifies seulement l’apparence visuelle des liens.",
      detectedType: "css:links",
      examples: [
        "color: #d86aa2;",
        "text-decoration: underline;",
      ],
    };
  }

  if (selectorLine?.startsWith("img")) {
    return {
      title: "Images du site",
      contextLabel,
      role: "Ces styles s’appliquent aux images affichées dans la page.",
      editable: "Tu peux ajuster leur taille ou leur comportement visuel.",
      caution: "Modifie ces valeurs progressivement pour éviter des images trop grandes ou déformées.",
      detectedType: "css:images",
      examples: [
        "max-width: 100%;",
        "display: block;",
      ],
    };
  }

  if (selectorLine?.startsWith("button")) {
    return {
      title: "Boutons du site",
      contextLabel,
      role: "Ces styles influencent l’apparence générale des boutons.",
      editable: "Tu peux modifier les couleurs, les bordures, les espacements ou la typographie.",
      caution: "Les changements ici peuvent être visibles sur plusieurs boutons du site.",
      detectedType: "css:buttons",
      examples: [
        "background: #d86aa2;",
        "border-radius: 999px;",
      ],
    };
  }

  if (trimmed.includes("color")) {
    return {
      title: "Couleur de texte",
      contextLabel,
      role: `Cette ligne change la couleur du texte dans le bloc ${selectorLine ?? "actuel"}.`,
      editable: "Tu peux changer la couleur pour mieux correspondre à l’identité visuelle du site.",
      caution: "Vérifie que le texte reste lisible sur son fond.",
      detectedType: "css:color",
      examples: [
        "color: #d86aa2;",
        "color: #1f2937;",
      ],
    };
  }

  if (trimmed.includes("text-decoration")) {
    return {
      title: "Soulignement ou décoration du texte",
      contextLabel,
      role: "Cette propriété gère par exemple le soulignement des liens.",
      editable: "Tu peux supprimer ou remettre le soulignement.",
      caution: "Si tu enlèves trop d’indices visuels, les liens peuvent devenir moins évidents pour l’utilisateur.",
      detectedType: "css:text-decoration",
      examples: [
        "text-decoration: none;",
        "text-decoration: underline;",
      ],
    };
  }

  if (trimmed.includes("background")) {
    return {
      title: "Arrière-plan",
      contextLabel,
      role: `Cette ligne modifie le fond du bloc ${selectorLine ?? "actuel"}.`,
      editable: "Tu peux changer la couleur, le dégradé ou l’image de fond.",
      caution: "Fais attention à garder un bon contraste avec le texte.",
      detectedType: "css:background",
      examples: [
        "background: #fffafc;",
        "background: linear-gradient(180deg, #fff, #f8edf2);",
      ],
    };
  }

  if (trimmed.includes("padding") || trimmed.includes("margin")) {
    return {
      title: "Espacement",
      contextLabel,
      role: `Cette ligne ajuste l’espace dans ou autour du bloc ${selectorLine ?? "actuel"}.`,
      editable: "Tu peux augmenter ou réduire cet espace pour aérer davantage ou resserrer la mise en page.",
      caution: "Modifie par petites étapes pour éviter un rendu déséquilibré.",
      detectedType: "css:spacing",
      examples: [
        "padding: 2rem;",
        "margin-bottom: 1rem;",
      ],
    };
  }

  if (
    trimmed.includes("font-size") ||
    trimmed.includes("font-family") ||
    trimmed.includes("font-weight")
  ) {
    return {
      title: "Style du texte",
      contextLabel,
      role: "Cette ligne influence la taille, la police ou l’épaisseur du texte.",
      editable: "Tu peux t’en servir pour rendre un texte plus élégant, plus grand ou plus discret.",
      caution: "Garde une bonne hiérarchie entre titres, sous-titres et paragraphes.",
      detectedType: "css:typography",
      examples: [
        "font-size: 3rem;",
        'font-family: "Playfair Display", serif;',
      ],
    };
  }

  if (
    trimmed.includes("display") ||
    trimmed.includes("grid") ||
    trimmed.includes("flex") ||
    trimmed.includes("justify-content") ||
    trimmed.includes("align-items")
  ) {
    return {
      title: "Mise en page",
      contextLabel,
      role: `Cette ligne organise la disposition des éléments dans le bloc ${selectorLine ?? "actuel"}.`,
      editable: "Tu peux modifier l’alignement ou la façon dont les éléments sont placés les uns par rapport aux autres.",
      caution: "Les changements ici peuvent déplacer plusieurs éléments en même temps.",
      detectedType: "css:layout",
      examples: [
        "display: flex;",
        "justify-content: center;",
        "align-items: center;",
      ],
    };
  }

  if (selectorLine) {
    return {
      title: "Style d’un bloc",
      contextLabel,
      role: `Tu es dans les styles appliqués au sélecteur ${selectorLine}.`,
      editable: "Tu peux modifier l’apparence du bloc ciblé : couleurs, espacements, typographie ou disposition.",
      caution: "Prends ton temps et teste une propriété à la fois pour voir ce qui change.",
      detectedType: "css:block",
      examples: [
        "color: #d86aa2;",
        "padding: 2rem;",
        "background: #fffafc;",
      ],
    };
  }

  return {
    title: "Règle CSS",
    contextLabel,
    role: "Cette ligne fait partie du style visuel du site.",
    editable: "Tu peux modifier cette propriété pour changer l’apparence du rendu.",
    caution: "Teste après modification pour voir l’impact visuel.",
    detectedType: "css:generic",
    examples: [
      "color: #111827;",
    ],
  };
}

function detectJsContext(
  line: string,
  snippet: string,
  contextLine: string | null
): Omit<SmartGuideResult, "snippet"> {
  const trimmed = line.trim();
  const contextLabel = detectSemanticSection(`${contextLine ?? ""}\n${snippet}`);

  if (trimmed.includes("addEventListener")) {
    return {
      title: "Réaction à une action utilisateur",
      contextLabel,
      role: "Ce code se déclenche quand l’utilisateur clique ou envoie un formulaire.",
      editable: "Tu peux modifier ce que le site doit faire quand cette action se produit.",
      caution: "Fais attention à ne pas casser le comportement attendu de la page.",
      detectedType: "js:event-listener",
      examples: [
        'navToggle.addEventListener("click", () => { ... })',
        'bookingForm.addEventListener("submit", async (e) => { ... })',
      ],
    };
  }

  if (trimmed.includes("document.getElementById") || trimmed.includes("querySelector")) {
    return {
      title: "Élément récupéré dans la page",
      contextLabel,
      role: "Cette ligne sert à récupérer un élément HTML pour le manipuler avec JavaScript.",
      editable: "Tu peux adapter la cible si le code HTML change.",
      caution: "Le nom utilisé ici doit correspondre exactement à celui du HTML.",
      detectedType: "js:dom-query",
      examples: [
        'const bookingForm = document.getElementById("bookingForm");',
      ],
    };
  }

  if (trimmed.includes("emailjs.send")) {
    return {
      title: "Envoi de formulaire avec EmailJS",
      contextLabel,
      role: "Ce code envoie les données du formulaire par email via EmailJS.",
      editable: "Tu peux modifier les données envoyées ou la logique de succès / erreur.",
      caution: "Vérifie que les clés et les noms de champs correspondent bien à ta configuration EmailJS.",
      detectedType: "js:emailjs",
      examples: [
        "await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);",
      ],
    };
  }

  if (trimmed.startsWith("const ") || trimmed.startsWith("let ")) {
    return {
      title: "Variable JavaScript",
      contextLabel,
      role: "Cette ligne stocke une valeur ou une référence utile dans le script.",
      editable: "Tu peux parfois changer la valeur, ou renommer la variable si tu sais ce que tu fais.",
      caution: "Si tu renommes une variable, il faut aussi mettre à jour ses autres utilisations.",
      detectedType: "js:variable",
      examples: [
        'const navToggle = document.getElementById("navToggle");',
      ],
    };
  }

  if (contextLine) {
    return {
      title: "Bloc JavaScript",
      contextLabel,
      role: `Tu es dans un morceau de logique lié à : ${contextLine}`,
      editable: "Tu peux modifier ce comportement si tu veux changer une interaction ou une action.",
      caution: "Teste toujours le formulaire, le menu ou le bouton concerné après modification.",
      detectedType: "js:block",
      examples: [
        'if (bookingForm) { ... }',
      ],
    };
  }

  return {
    title: "Code JavaScript",
    contextLabel,
    role: "Ce code gère un comportement dynamique du site.",
    editable: "Tu peux modifier cette logique si tu veux changer une interaction.",
    caution: "Attention à ne pas créer d’erreur de syntaxe.",
    detectedType: "js:generic",
    examples: [
      'console.log("hello");',
    ],
  };
}

export function analyzeCodeAtCursor(
  path: string,
  content: string,
  lineNumber: number,
  column: number
): SmartGuideResult {
  const language = getLanguageFromPath(path);
  const lines = getLines(content);
  const currentLine = getSafeLine(lines, lineNumber - 1);
  const snippet = extractSnippet(lines, lineNumber, 6);

  if (language === "html") {
    const base = detectHtmlContext(currentLine, snippet);
    return { ...base, snippet };
  }

  if (language === "css") {
    const selectorLine = findNearestMatch(lines, lineNumber - 1, [
      /^\s*\.[\w-]+\s*\{/,
      /^\s*#[\w-]+\s*\{/,
      /^\s*[a-zA-Z][\w-]*\s*\{/,
      /^\s*a\s*\{/,
      /^\s*img\s*\{/,
      /^\s*button\s*\{/,
      /^\s*input\s*\{/,
      /^\s*textarea\s*\{/,
    ]);
    const base = detectCssContext(currentLine, snippet, selectorLine);
    return { ...base, snippet };
  }

  if (["javascript", "typescript", "tsx"].includes(language)) {
    const contextLine = findNearestMatch(lines, lineNumber - 1, [
      /addEventListener/,
      /^\s*function /,
      /^\s*const .*=\s*\(/,
      /^\s*const .*=\s*async/,
      /^\s*if\s*\(/,
    ]);
    const base = detectJsContext(currentLine, snippet, contextLine);
    return { ...base, snippet };
  }

  return {
    title: "Bloc de code",
    contextLabel: "Fichier courant",
    role: "Ce bloc fait partie du fichier actuellement édité.",
    editable: "Tu peux modifier ce contenu selon ton besoin.",
    caution: "Vérifie le rendu ou le comportement après sauvegarde.",
    detectedType: `${language}:generic`,
    snippet,
    examples: [],
  };
}