/**
 * Garde-Clé : affichage de la page de résultats.
 *
 * Reçoit l'objet calculé par computeResults (scoring.js) et construit le
 * contenu de la section #resultats. Aucun calcul ici, seulement de l'affichage.
 */
import { ANSWER_OPTIONS, SOURCES, UNKNOWN_MESSAGE } from "./data/questions.js";
import { levelFor } from "./scoring.js";

const answerLabel = Object.fromEntries(ANSWER_OPTIONS.map((o) => [o.id, o.label]));

// Couleur du libellé selon le niveau. Le niveau reste toujours écrit en
// toutes lettres : la couleur n'est qu'un repère en plus.
const BADGE_BY_LEVEL = { critique: "grave", ameliorer: "attention", correct: "info", bon: "ok" };

/**
 * Petite fonction utilitaire pour créer un élément :
 *   h("p", { class: "aide", text: "Bonjour" })
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

// Texte lu uniquement par les lecteurs d'écran
const srOnly = (text) => h("span", { class: "sr-only", text });

/**
 * Lien vers une source officielle. Il s'ouvre dans un nouvel onglet pour
 * ne pas quitter la page : les résultats, gardés en mémoire seulement,
 * seraient perdus. rel="noopener noreferrer" : le site ouvert ne peut ni
 * contrôler cet onglet ni savoir d'où vient le visiteur.
 */
function sourceLink({ ref, detail }) {
  const source = SOURCES[ref];
  const label = detail ? `${source.label} (${detail})` : source.label;
  return h(
    "a",
    { href: source.url, target: "_blank", rel: "noopener noreferrer" },
    label,
    srOnly(" (s'ouvre dans un nouvel onglet)")
  );
}

/* ---------- 1. Verdict : le tampon du niveau ---------- */
function renderVerdict({ score, level, capped }) {
  return h(
    "div",
    { class: `verdict verdict--${level.id}` },
    // Le tampon : niveau en capitales (par CSS), posé une seule fois
    h("p", { class: "tampon" }, srOnly("Niveau\u00A0: "), level.label),
    h(
      "div",
      {},
      h(
        "p",
        { class: "score" },
        h("span", { text: `Score\u00A0: ${score} / 100` }),
        // Jauge visuelle ; le score est déjà écrit à côté, on la masque aux lecteurs d'écran
        h("meter", { min: "0", max: "100", low: "40", high: "80", optimum: "100", value: String(score), "aria-hidden": "true" })
      ),
      h("p", { text: level.message }),
      capped &&
        h("p", {
          class: "verdict__raison",
          text:
            "Votre score seul correspondrait à un niveau plus élevé, mais au moins une protection " +
            "essentielle manque ou n'est pas connue. Tant qu'elle n'est pas en place, le niveau " +
            "reste limité à «\u00A0À améliorer\u00A0».",
        })
    )
  );
}

/* ---------- 2. Actions prioritaires ----------
   Liste à deux colonnes : la réponse donnée à gauche, l'action à droite.
   Le numéro est ajouté devant le titre par CSS (compteur). */
function renderPriority({ question, answerId }) {
  const gravite = answerId === "partiel" ? "attention" : "grave";
  return h(
    "li",
    { class: "signal" },
    h("p", { class: `badge badge--${gravite}` }, srOnly("Votre réponse\u00A0: "), answerLabel[answerId]),
    h(
      "div",
      {},
      h("h3", { class: "action-titre", text: question.action.title }),
      h("p", { text: question.action.why }),
      answerId === "nsp" && h("p", { class: "aide", text: UNKNOWN_MESSAGE }),
      h(
        "p",
        { class: "sources" },
        question.sources.length > 1 ? "Sources\u00A0: " : "Source\u00A0: ",
        ...question.sources.flatMap((s, i) => (i === 0 ? [sourceLink(s)] : [" · ", sourceLink(s)]))
      )
    )
  );
}

/* ---------- 3. Score par thème : une ligne de tableau ---------- */
function renderTheme({ label, score }) {
  const level = levelFor(score);
  return h(
    "tr",
    {},
    h("th", { scope: "row", text: label }),
    h("td", { class: "nombre", text: `${score} / 100` }),
    h("td", {}, h("span", { class: `badge badge--${BADGE_BY_LEVEL[level.id]}`, text: level.label }))
  );
}

/* ---------- 4. Point d'entrée ---------- */
/** Remplit la section #resultats à partir des résultats calculés. */
export function renderResults(results) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  document.getElementById("resultats-date").textContent =
    `Diagnostic réalisé le ${date}, sur 15 points essentiels de sécurité.`;

  document.getElementById("score-global").replaceChildren(renderVerdict(results));

  const list = document.getElementById("actions-prioritaires");
  if (results.priorities.length === 0) {
    list.replaceChildren(
      h("li", {
        text: "Aucune action prioritaire\u00A0: toutes les protections évaluées sont en place. Bravo, continuez ainsi.",
      })
    );
  } else {
    list.replaceChildren(...results.priorities.map(renderPriority));
  }

  document.getElementById("scores-themes").replaceChildren(...results.themeScores.map(renderTheme));
}
