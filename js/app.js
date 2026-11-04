/**
 * Garde-Clé : point d'entrée et navigation dans le questionnaire.
 *
 * Les réponses sont gardées dans une simple variable en mémoire :
 * pas de localStorage, pas de cookie, rien n'est envoyé. Recharger
 * la page efface tout, et c'est voulu.
 */
import { ANSWER_OPTIONS, QUESTIONS, THEMES } from "./data/questions.js";
import { computeResults } from "./scoring.js";
import { renderResults } from "./results.js";

/* ---------- 1. État de l'application ---------- */
const state = {
  index: 0,      // position de la question affichée
  answers: {},   // { S1: "oui", S2: "nsp", ... }
};

/* ---------- 2. Raccourcis vers les éléments de la page ---------- */
const $ = (id) => document.getElementById(id);

const sections = {
  accueil: $("accueil"),
  questionnaire: $("questionnaire"),
  resultats: $("resultats"),
};

const el = {
  btnCommencer: $("btn-commencer"),
  form: $("form-question"),
  titre: $("titre-question"),
  aide: $("question-aide"),
  reponses: $("reponses"),
  erreur: $("erreur-question"),
  btnPrecedent: $("btn-precedent"),
  btnSuivant: $("btn-suivant"),
  progressionNum: $("progression-num"),
  progressionTotal: $("progression-total"),
  progressionTheme: $("progression-theme"),
  progressionBarre: $("progression-barre"),
  titreResultats: $("titre-resultats"),
  btnRecommencer: $("btn-recommencer"),
};

const themeLabel = Object.fromEntries(THEMES.map((t) => [t.id, t.label]));

/* ---------- 3. Affichage d'une section ---------- */
/**
 * Affiche une seule section, remonte en haut de page et place le focus
 * sur son titre : un lecteur d'écran annonce ainsi le nouveau contenu.
 */
function showSection(name, focusTarget) {
  for (const [key, section] of Object.entries(sections)) {
    section.hidden = key !== name;
  }
  window.scrollTo(0, 0);
  focusTarget?.focus();
}

/* ---------- 4. Affichage d'une question ---------- */
function renderQuestion() {
  const q = QUESTIONS[state.index];
  const total = QUESTIONS.length;

  // Progression
  el.progressionNum.textContent = state.index + 1;
  el.progressionTotal.textContent = total;
  el.progressionTheme.textContent = themeLabel[q.theme];
  el.progressionBarre.max = total;
  el.progressionBarre.value = state.index + 1;

  // Texte et aide. textContent (et non innerHTML) insère du texte brut :
  // aucun risque d'injecter du code HTML dans la page.
  el.titre.textContent = q.text;
  el.aide.textContent = q.help ?? "";
  el.aide.hidden = !q.help;

  // Réponses : reconstruites à chaque question, la précédente cochée si elle existe.
  el.reponses.replaceChildren(
    ...ANSWER_OPTIONS.map((option) => {
      const label = document.createElement("label");
      label.className = "reponse";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "reponse";
      input.value = option.id;
      input.checked = state.answers[q.id] === option.id;

      const span = document.createElement("span");
      span.textContent = option.label;

      label.append(input, span);
      return label;
    })
  );

  el.erreur.hidden = true;

  // Libellés des boutons selon la position
  el.btnPrecedent.textContent = state.index === 0 ? "Retour à l'accueil" : "Précédent";
  el.btnSuivant.textContent = state.index === total - 1 ? "Voir mes résultats" : "Suivant";

  el.titre.focus();
}

/* ---------- 5. Résultats ---------- */
function showResults() {
  renderResults(computeResults(state.answers));
  showSection("resultats", el.titreResultats);
}

/* ---------- 6. Événements ---------- */

// Démarrer le diagnostic
el.btnCommencer.addEventListener("click", () => {
  state.index = 0;
  showSection("questionnaire");
  renderQuestion();
});

// Valider une réponse ("Suivant", ou touche Entrée sur une réponse)
el.form.addEventListener("submit", (event) => {
  event.preventDefault(); // empêche le rechargement de la page

  const checked = el.form.querySelector('input[name="reponse"]:checked');
  if (!checked) {
    el.erreur.hidden = false;
    el.reponses.querySelector("input")?.focus();
    return;
  }

  state.answers[QUESTIONS[state.index].id] = checked.value;

  if (state.index < QUESTIONS.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    showResults();
  }
});

// Masquer le message d'erreur dès qu'une réponse est choisie
el.reponses.addEventListener("change", () => {
  el.erreur.hidden = true;
});

// Revenir en arrière (la réponse déjà donnée reste cochée)
el.btnPrecedent.addEventListener("click", () => {
  if (state.index === 0) {
    showSection("accueil", el.btnCommencer);
    return;
  }
  state.index -= 1;
  renderQuestion();
});

// Recommencer : on efface toutes les réponses
el.btnRecommencer.addEventListener("click", () => {
  state.index = 0;
  state.answers = {};
  showSection("accueil", el.btnCommencer);
});
