/**
 * Garde-Clé : affichage de la page de résultats.
 *
 * Reçoit l'objet calculé par computeResults (scoring.js) et construit le
 * contenu de la section #resultats. Aucun calcul ici, seulement de l'affichage.
 */
import { ANSWER_OPTIONS, SOURCES, UNKNOWN_MESSAGE } from "./data/questions.js";
import { levelFor } from "./scoring.js";

const answerLabel = Object.fromEntries(ANSWER_OPTIONS.map((o) => [o.id, o.label]));

/**
 * Petite fonction utilitaire pour créer un élément :
 *   h("p", { class: "note", text: "Bonjour" })
 * Les enfants de type chaîne deviennent des nœuds texte (jamais du HTML),
 * ce qui évite toute injection de code.
 */
function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

/**
 * Lien vers une source officielle. Il s'ouvre dans un nouvel onglet pour
 * ne pas quitter la page : les résultats, gardés en mémoire seulement,
 * seraient perdus. Le texte masqué prévient les lecteurs d'écran.
 * rel="noopener noreferrer" : le site ouvert ne peut ni contrôler cet onglet
 * ni savoir d'où vient le visiteur.
 */
function sourceLink({ ref, detail }) {
  const source = SOURCES[ref];
  const label = detail ? `${source.label} (${detail})` : source.label;
  return h(
    "a",
    { href: source.url, target: "_blank", rel: "noopener noreferrer" },
    label,
    h("span", { class: "visually-hidden", text: " (s'ouvre dans un nouvel onglet)" })
  );
}

/* ---------- 1. Score global et niveau ---------- */
function renderScore(results) {
  const { score, level, capped } = results;

  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    h(
      "p",
      { class: "score-valeur" },
      h("span", { class: "score-nombre", text: String(score) }),
      h("span", { class: "score-sur", text: " / 100" })
    ),
    // Le niveau est écrit en toutes lettres : la couleur n'est qu'un repère en plus.
    h("p", { class: `niveau-badge niveau-${level.id}`, text: `Niveau : ${level.label}` }),
    h("p", { class: "niveau-message", text: level.message }),
    capped &&
      h("p", {
        class: "niveau-plafond",
        text:
          "Votre score seul correspondrait à un niveau plus élevé, mais au moins une protection " +
          "essentielle manque ou n'est pas connue. Tant qu'elle n'est pas en place, le niveau " +
          "reste limité à « À améliorer ».",
      }),
    h("p", { class: "note", text: `Diagnostic réalisé le ${date}.` }),
  ];
}

/* ---------- 2. Actions prioritaires ---------- */
function renderPriority({ question, answerId }) {
  return h(
    "li",
    { class: "action" },
    h("h3", { class: "action-titre", text: question.action.title }),
    h("p", { class: "action-reponse", text: `Votre réponse : ${answerLabel[answerId]}` }),
    h("p", { text: question.action.why }),
    answerId === "nsp" && h("p", { class: "action-nsp", text: UNKNOWN_MESSAGE }),
    h(
      "p",
      { class: "action-sources" },
      question.sources.length > 1 ? "Sources : " : "Source : ",
      ...question.sources.flatMap((s, i) => (i === 0 ? [sourceLink(s)] : [" · ", sourceLink(s)]))
    )
  );
}

/* ---------- 3. Score par thème ---------- */
function renderTheme({ label, score }) {
  const level = levelFor(score);
  const barre = h("span", { class: `theme-barre niveau-${level.id}`, "aria-hidden": "true" });
  // Largeur passée par une variable CSS. Modifier node.style via JavaScript
  // reste autorisé par notre CSP, contrairement à un attribut style="" écrit en dur.
  barre.style.setProperty("--valeur", `${score}%`);

  return h(
    "li",
    { class: "theme" },
    h(
      "span",
      { class: "theme-ligne" },
      h("span", { class: "theme-nom", text: label }),
      h("span", { class: "theme-score", text: `${score} / 100` })
    ),
    h("span", { class: "theme-piste", "aria-hidden": "true" }, barre)
  );
}

/* ---------- 4. Point d'entrée ---------- */
/** Remplit la section #resultats à partir des résultats calculés. */
export function renderResults(results) {
  document.getElementById("score-global").replaceChildren(...renderScore(results).filter(Boolean));

  const list = document.getElementById("actions-prioritaires");
  if (results.priorities.length === 0) {
    list.replaceChildren(
      h("li", {
        class: "action action-vide",
        text: "Aucune action prioritaire : toutes les protections évaluées sont en place. Bravo, continuez ainsi.",
      })
    );
  } else {
    list.replaceChildren(...results.priorities.map(renderPriority));
  }

  document.getElementById("scores-themes").replaceChildren(...results.themeScores.map(renderTheme));
}
