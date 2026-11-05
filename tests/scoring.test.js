/**
 * Garde-Clé : tests automatiques du calcul et du contenu.
 *
 * Lancement : npm test   (ou : node --test "tests/*.test.js")
 * Utilise le lanceur de tests intégré à Node (18 et plus) : aucune dépendance.
 *
 * Principe : on donne des réponses dont on connaît le résultat attendu,
 * calculé à la main, et on vérifie que le code trouve la même chose.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { answerValue, weightedScore, levelFor, computeResults } from "../js/scoring.js";
import { ANSWER_OPTIONS, LEVELS, QUESTIONS, SOURCES, THEMES } from "../js/data/questions.js";

// Réponses identiques pour toutes les questions, ex. allAnswers("oui")
const allAnswers = (id) => Object.fromEntries(QUESTIONS.map((q) => [q.id, id]));

/* ---------- 1. Valeur des réponses ---------- */
test("chaque réponse a la valeur prévue", () => {
  assert.equal(answerValue("oui"), 1);
  assert.equal(answerValue("partiel"), 0.5);
  assert.equal(answerValue("non"), 0);
  assert.equal(answerValue("nsp"), 0, "« Je ne sais pas » compte comme un risque");
});

test("une réponse inconnue déclenche une erreur", () => {
  assert.throws(() => answerValue("peut-être"), /Réponse inconnue/);
});

/* ---------- 2. Score global ---------- */
test("tout Oui = 100, tout Non = 0, tout En partie = 50", () => {
  assert.equal(computeResults(allAnswers("oui")).score, 100);
  assert.equal(computeResults(allAnswers("non")).score, 0);
  assert.equal(computeResults(allAnswers("partiel")).score, 50);
});

test("le score est pondéré : (34 − 3) / 34 × 100 = 91 si une question de poids 3 est à Non", () => {
  assert.equal(computeResults({ ...allAnswers("oui"), S2: "non" }).score, 91);
});

test("weightedScore sur un petit jeu de données", () => {
  const qs = [{ id: "a", weight: 3 }, { id: "b", weight: 1 }];
  // (3 × 0,5 + 1 × 1) / 4 = 62,5 -> arrondi à 63
  assert.equal(weightedScore(qs, { a: "partiel", b: "oui" }), 63);
});

/* ---------- 3. Niveaux et seuils ---------- */
test("les seuils de niveau tombent au bon endroit", () => {
  const cas = [[0, "critique"], [39, "critique"], [40, "ameliorer"], [59, "ameliorer"],
               [60, "correct"], [79, "correct"], [80, "bon"], [100, "bon"]];
  for (const [score, attendu] of cas) {
    assert.equal(levelFor(score).id, attendu, `score ${score}`);
  }
});

/* ---------- 4. Garde-fou ---------- */
test("une faille critique (poids 3 à Non) plafonne le niveau à « À améliorer »", () => {
  const r = computeResults({ ...allAnswers("oui"), S2: "non" });
  assert.equal(r.level.id, "ameliorer");
  assert.equal(r.capped, true);
});

test("« Je ne sais pas » sur une question critique déclenche aussi le garde-fou", () => {
  const r = computeResults({ ...allAnswers("oui"), A2: "nsp" });
  assert.equal(r.capped, true);
});

test("« En partie » sur une question critique ne déclenche pas le garde-fou", () => {
  const r = computeResults({ ...allAnswers("oui"), S2: "partiel" });
  assert.equal(r.score, 96);
  assert.equal(r.level.id, "bon");
  assert.equal(r.capped, false);
});

test("le garde-fou n'est pas signalé quand le niveau est déjà bas", () => {
  const r = computeResults(allAnswers("non"));
  assert.equal(r.level.id, "critique");
  assert.equal(r.capped, false);
});

/* ---------- 5. Actions prioritaires ---------- */
test("tout Oui : aucune action prioritaire", () => {
  assert.equal(computeResults(allAnswers("oui")).priorities.length, 0);
});

test("tout Non : les 5 questions de poids 3, dans l'ordre du questionnaire", () => {
  const ids = computeResults(allAnswers("non")).priorities.map((p) => p.question.id);
  assert.deepEqual(ids, ["S1", "S2", "A2", "M1", "W2"]);
});

test("l'impact prime sur le poids : un Non de poids 2 passe avant un En partie de poids 3", () => {
  // S1 (poids 3) en partie : impact 1,5. S3 (poids 2) à Non : impact 2.
  const r = computeResults({ ...allAnswers("oui"), S1: "partiel", S3: "non" });
  assert.deepEqual(r.priorities.map((p) => p.question.id), ["S3", "S1"]);
});

test("cas mixte vérifié à la main : 49, À améliorer, S2 A2 S3 P2 H1", () => {
  const reponses = {
    S1: "partiel", S2: "nsp", S3: "non", A1: "oui", A2: "non", M1: "oui", M2: "oui",
    P1: "oui", P2: "non", E1: "partiel", E2: "oui", W1: "partiel", W2: "oui", H1: "nsp", I1: "non",
  };
  const r = computeResults(reponses);
  assert.equal(r.score, 49);
  assert.equal(r.level.id, "ameliorer");
  assert.deepEqual(r.priorities.map((p) => p.question.id), ["S2", "A2", "S3", "P2", "H1"]);
  const sauvegardes = r.themeScores.find((t) => t.id === "sauvegardes");
  assert.equal(sauvegardes.score, 19); // 1,5 / 8
});

test("jamais plus de 5 actions", () => {
  assert.ok(computeResults(allAnswers("nsp")).priorities.length <= 5);
});

/* ---------- 6. Réponses incomplètes ---------- */
test("un questionnaire incomplet déclenche une erreur explicite", () => {
  assert.throws(() => computeResults({ S1: "oui" }), /Questions sans réponse/);
});

/* ---------- 7. Cohérence du contenu ---------- */
test("le contenu est cohérent (thèmes, poids, sources, identifiants)", () => {
  assert.equal(QUESTIONS.length, 15);

  const ids = QUESTIONS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "identifiants uniques");

  const themeIds = new Set(THEMES.map((t) => t.id));
  for (const q of QUESTIONS) {
    assert.ok(themeIds.has(q.theme), `${q.id} : thème inconnu`);
    assert.ok([1, 2, 3].includes(q.weight), `${q.id} : poids invalide`);
    assert.ok(q.action?.title && q.action?.why, `${q.id} : recommandation manquante`);
    assert.ok(q.sources.length > 0, `${q.id} : aucune source`);
    for (const s of q.sources) assert.ok(SOURCES[s.ref], `${q.id} : source ${s.ref} inconnue`);
  }

  for (const t of THEMES) {
    assert.ok(QUESTIONS.some((q) => q.theme === t.id), `thème ${t.id} sans question`);
  }
});

test("toutes les sources pointent vers un site officiel en HTTPS", () => {
  const domaines = ["cyber.gouv.fr", "cybermalveillance.gouv.fr", "cnil.fr"];
  for (const [cle, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", cle);
    assert.ok(domaines.some((d) => url.hostname === d || url.hostname.endsWith("." + d)), `${cle} : ${url.hostname}`);
  }
});

test("les niveaux sont triés et commencent à 0", () => {
  assert.equal(LEVELS[0].min, 0);
  for (let i = 1; i < LEVELS.length; i++) assert.ok(LEVELS[i].min > LEVELS[i - 1].min);
  assert.equal(ANSWER_OPTIONS.length, 4);
});
