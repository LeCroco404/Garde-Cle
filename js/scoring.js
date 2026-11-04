/**
 * Garde-Clé : calcul des scores.
 *
 * Ce module ne contient que des fonctions "pures" : elles reçoivent des
 * réponses et renvoient des résultats, sans lire ni modifier la page.
 * Pour les mêmes réponses, elles donnent toujours le même résultat,
 * ce qui les rend faciles à tester (étape 6).
 *
 * Format des réponses : un objet { idQuestion: idRéponse },
 * par exemple { S1: "oui", S2: "nsp", ... }.
 */
import { ANSWER_OPTIONS, LEVELS, RULES, QUESTIONS, THEMES } from "./data/questions.js";

// Table de correspondance id de réponse -> valeur, ex. { oui: 1, partiel: 0.5, ... }
const VALUE_BY_ID = Object.fromEntries(ANSWER_OPTIONS.map((o) => [o.id, o.value]));

/** Valeur (entre 0 et 1) d'une réponse. Erreur si l'id est inconnu. */
export function answerValue(answerId) {
  if (!Object.hasOwn(VALUE_BY_ID, answerId)) {
    throw new Error(`Réponse inconnue : ${answerId}`);
  }
  return VALUE_BY_ID[answerId];
}

/**
 * Score sur 100 d'un groupe de questions :
 * somme (poids × valeur) / somme des poids × 100, arrondi à l'entier.
 */
export function weightedScore(questions, answers) {
  let obtained = 0;
  let total = 0;
  for (const q of questions) {
    total += q.weight;
    obtained += q.weight * answerValue(answers[q.id]);
  }
  return total === 0 ? null : Math.round((obtained / total) * 100);
}

/** Niveau correspondant à un score : le plus haut dont le minimum est atteint. */
export function levelFor(score, levels = LEVELS) {
  let level = levels[0];
  for (const l of levels) {
    if (score >= l.min) level = l;
  }
  return level;
}

/**
 * Calcule tous les résultats du diagnostic.
 * Les données sont passées en option pour pouvoir tester avec d'autres jeux.
 *
 * Renvoie :
 *   score        score global sur 100
 *   level        niveau final (après garde-fou)
 *   capped       true si le garde-fou a abaissé le niveau
 *   themeScores  [{ id, label, score }] dans l'ordre des thèmes
 *   priorities   jusqu'à RULES.priorityCount actions, de la plus urgente à la moins urgente
 */
export function computeResults(
  answers,
  { questions = QUESTIONS, themes = THEMES, levels = LEVELS, rules = RULES } = {}
) {
  // Toutes les questions doivent avoir une réponse.
  const missing = questions.filter((q) => !Object.hasOwn(answers, q.id));
  if (missing.length > 0) {
    throw new Error(`Questions sans réponse : ${missing.map((q) => q.id).join(", ")}`);
  }

  const score = weightedScore(questions, answers);
  let level = levelFor(score, levels);

  // Garde-fou : une faille critique (poids max, réponse de valeur 0)
  // empêche de dépasser le niveau plafond.
  const hasCriticalGap = questions.some(
    (q) => q.weight >= rules.criticalWeight && answerValue(answers[q.id]) === 0
  );
  const capIndex = levels.findIndex((l) => l.id === rules.capLevelId);
  const levelIndex = levels.indexOf(level);
  const capped = hasCriticalGap && levelIndex > capIndex;
  if (capped) level = levels[capIndex];

  // Score de chaque thème, calculé sur ses seules questions.
  const themeScores = themes.map((t) => ({
    id: t.id,
    label: t.label,
    score: weightedScore(questions.filter((q) => q.theme === t.id), answers),
  }));

  // Actions prioritaires : impact = poids × (1 − valeur).
  // Égalité : poids le plus fort d'abord, puis ordre du questionnaire.
  const priorities = questions
    .map((q, index) => ({
      question: q,
      answerId: answers[q.id],
      impact: q.weight * (1 - answerValue(answers[q.id])),
      index,
    }))
    .filter((p) => p.impact > 0)
    .sort(
      (a, b) =>
        b.impact - a.impact ||
        b.question.weight - a.question.weight ||
        a.index - b.index
    )
    .slice(0, rules.priorityCount);

  return { score, level, capped, themeScores, priorities };
}
