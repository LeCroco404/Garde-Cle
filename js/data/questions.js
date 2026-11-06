/**
 * Garde-Clé : contenu du questionnaire.
 *
 * Ce fichier ne contient que des données : questions, poids, règles de
 * calcul, recommandations et sources. Aucune logique ici. Pour modifier
 * une formulation ou une source, on ne touche qu'à ce fichier.
 *
 * Les seuils de niveau et les poids sont des choix de conception de
 * l'outil, pas des données officielles.
 */

/* ------------------------------------------------------------------ */
/* 1. Réponses possibles et leur valeur (1 = protégé, 0 = exposé)      */
/* ------------------------------------------------------------------ */
export const ANSWER_OPTIONS = [
  { id: "oui", label: "Oui", value: 1 },
  { id: "partiel", label: "En partie", value: 0.5 },
  { id: "non", label: "Non", value: 0 },
  // "Je ne sais pas" compte comme un risque : on ne peut pas se fier
  // à une protection dont on ignore l'existence.
  { id: "nsp", label: "Je ne sais pas", value: 0 },
];

// Message affiché avec la recommandation quand la réponse est "Je ne sais pas".
export const UNKNOWN_MESSAGE =
  "Pas sûr\u00A0? Posez la question à votre prestataire informatique, c'est le bon point de départ.";

/* ------------------------------------------------------------------ */
/* 2. Niveaux de maturité (score global sur 100)                       */
/* ------------------------------------------------------------------ */
// "min" = score minimal pour atteindre le niveau. Ordre croissant.
export const LEVELS = [
  {
    id: "critique", label: "Critique", min: 0,
    message: "Plusieurs protections essentielles manquent. Pas de panique\u00A0: avancez une action à la fois, en commençant par la première ci-dessous.",
  },
  {
    id: "ameliorer", label: "À améliorer", min: 40,
    message: "Les bases sont en partie là, mais des failles importantes restent ouvertes. Les actions ci-dessous sont à traiter en priorité.",
  },
  {
    id: "correct", label: "Correct", min: 60,
    message: "Votre structure a de bonnes bases. Quelques points restent à renforcer.",
  },
  {
    id: "bon", label: "Bon", min: 80,
    message: "Votre structure applique l'essentiel des bonnes pratiques évaluées ici. Gardez ces habitudes et refaites le diagnostic de temps en temps.",
  },
];

/* ------------------------------------------------------------------ */
/* 3. Règles de calcul                                                 */
/* ------------------------------------------------------------------ */
export const RULES = {
  // Garde-fou : si une question de ce poids reçoit une réponse de valeur 0
  // (Non ou Je ne sais pas), le niveau est plafonné à CAP_LEVEL_ID.
  criticalWeight: 3,
  capLevelId: "ameliorer",
  // Nombre d'actions prioritaires affichées dans les résultats.
  priorityCount: 5,
};

/* ------------------------------------------------------------------ */
/* 4. Sources officielles (référencées par clé dans les questions)     */
/* ------------------------------------------------------------------ */
export const SOURCES = {
  anssiHygiene: {
    label: "ANSSI, Guide d'hygiène informatique",
    url: "https://messervices.cyber.gouv.fr/guides/guide-dhygiene-informatique",
  },
  cmSauvegardes: {
    label: "Cybermalveillance.gouv.fr, Sauvegardes",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/sauvegardes",
  },
  cmMotsDePasse: {
    label: "Cybermalveillance.gouv.fr, Mots de passe",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mots-de-passe",
  },
  cmMisesAJour: {
    label: "Cybermalveillance.gouv.fr, Mises à jour",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mises-a-jour",
  },
  cm10Mesures: {
    label: "Cybermalveillance.gouv.fr, 10 mesures essentielles",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/10-mesures-essentielles-assurer-securite-numerique",
  },
  cmProPerso: {
    label: "Cybermalveillance.gouv.fr, Séparer usages pro et perso",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/securite-usages-pro-perso",
  },
  cmTeletravail: {
    label: "Cybermalveillance.gouv.fr, Sécurisation du télétravail",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/securisation-du-teletravail",
  },
  cmHameconnage: {
    label: "Cybermalveillance.gouv.fr, Fiche hameçonnage",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/hameconnage-phishing",
  },
  cmRancongiciel: {
    label: "Cybermalveillance.gouv.fr, Fiche rançongiciel",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/rancongiciels-ransomwares",
  },
  cm5Recos: {
    label: "Cybermalveillance.gouv.fr, 5 recommandations essentielles (PDF)",
    url: "https://www.cybermalveillance.gouv.fr/medias/2023/09/5-recommandations-essentielles-pour-les-entreprises-2.pdf",
  },
};

/* ------------------------------------------------------------------ */
/* 5. Thèmes, dans l'ordre d'affichage                                 */
/* ------------------------------------------------------------------ */
export const THEMES = [
  { id: "sauvegardes", label: "Sauvegardes" },
  { id: "acces", label: "Mots de passe et double authentification" },
  { id: "majs", label: "Mises à jour" },
  { id: "postes", label: "Postes et antivirus" },
  { id: "messagerie", label: "Messagerie et hameçonnage" },
  { id: "reseau", label: "Wi-Fi et accès à distance" },
  { id: "equipe", label: "Sensibilisation du personnel" },
  { id: "incident", label: "Réaction en cas d'incident" },
];

/* ------------------------------------------------------------------ */
/* 6. Questions                                                        */
/* ------------------------------------------------------------------ */
/*
 * Champs :
 *   id      identifiant court et stable
 *   theme   id d'un thème ci-dessus
 *   weight  3 = critique, 2 = important, 1 = utile
 *   text    la question posée
 *   help    (facultatif) précision affichée sous la question
 *   action  { title, why } : recommandation si la réponse n'est pas "Oui"
 *   sources liste de { ref, detail? } ; ref = clé de SOURCES
 */
export const QUESTIONS = [
  // --- Sauvegardes -------------------------------------------------
  {
    id: "S1",
    theme: "sauvegardes",
    weight: 3,
    text: "Vos données importantes (dossiers patients, comptabilité, fichiers d'adhérents) sont-elles sauvegardées automatiquement et régulièrement\u00A0?",
    action: {
      title: "Mettre en place une sauvegarde automatique",
      why: "Programmez une sauvegarde automatique, à une fréquence adaptée au rythme auquel vos données changent. Sans sauvegarde, une panne, un vol ou un rançongiciel peut faire disparaître définitivement votre travail.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 37" },
      { ref: "cmSauvegardes" },
    ],
  },
  {
    id: "S2",
    theme: "sauvegardes",
    weight: 3,
    text: "Au moins une copie de vos sauvegardes est-elle gardée déconnectée (disque débranché après usage, copie hors ligne)\u00A0?",
    action: {
      title: "Garder une copie de sauvegarde débranchée",
      why: "Gardez une copie débranchée du réseau. Un rançongiciel peut aussi chiffrer les sauvegardes restées branchées, et c'est souvent ce qui empêche de redémarrer.",
    },
    sources: [{ ref: "cmRancongiciel" }, { ref: "cm5Recos" }],
  },
  {
    id: "S3",
    theme: "sauvegardes",
    weight: 2,
    text: "Avez-vous déjà vérifié que vous savez restaurer des fichiers depuis une sauvegarde\u00A0?",
    action: {
      title: "Tester la restauration de vos sauvegardes",
      why: "Essayez de temps en temps de restaurer quelques fichiers. Une sauvegarde jamais testée peut se révéler inutilisable le jour où on en a besoin.",
    },
    sources: [{ ref: "cmRancongiciel" }, { ref: "cmSauvegardes" }],
  },

  // --- Mots de passe et double authentification --------------------
  {
    id: "A1",
    theme: "acces",
    weight: 2,
    text: "Utilisez-vous des mots de passe longs et différents pour chaque service, par exemple grâce à un gestionnaire de mots de passe\u00A0?",
    action: {
      title: "Utiliser un mot de passe différent par service",
      why: "Un mot de passe par service, rangé dans un gestionnaire de mots de passe. Si un site se fait pirater, vos autres comptes restent protégés.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 10" },
      { ref: "cmMotsDePasse" },
    ],
  },
  {
    id: "A2",
    theme: "acces",
    weight: 3,
    text: "La double authentification (un code reçu sur le téléphone en plus du mot de passe) est-elle activée sur la messagerie et les services sensibles (banque, logiciel métier en ligne)\u00A0?",
    action: {
      title: "Activer la double authentification",
      why: "Activez-la en commençant par la messagerie. Quelqu'un qui contrôle votre boîte mail peut réinitialiser la plupart de vos autres mots de passe.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 13" },
      { ref: "cm5Recos" },
    ],
  },

  // --- Mises à jour ------------------------------------------------
  {
    id: "M1",
    theme: "majs",
    weight: 3,
    text: "Les mises à jour s'installent-elles automatiquement, ou sans tarder, sur les ordinateurs, téléphones et logiciels\u00A0?",
    action: {
      title: "Activer les mises à jour automatiques",
      why: "Activez les mises à jour automatiques. Elles corrigent des failles que les attaquants connaissent et exploitent.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 34" },
      { ref: "cmMisesAJour" },
    ],
  },
  {
    id: "M2",
    theme: "majs",
    weight: 2,
    text: "Tous vos appareils utilisent-ils un système encore mis à jour par son éditeur\u00A0?",
    help: "Par exemple, Windows 7 n'est plus mis à jour.",
    action: {
      title: "Remplacer les systèmes qui ne sont plus mis à jour",
      why: "Prévoyez le remplacement ou la mise à niveau des appareils concernés. Un système abandonné ne reçoit plus de correctifs, donc chaque nouvelle faille reste ouverte.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 35" },
      { ref: "cmMisesAJour" },
    ],
  },

  // --- Postes et antivirus -----------------------------------------
  {
    id: "P1",
    theme: "postes",
    weight: 2,
    text: "Chaque ordinateur a-t-il un antivirus actif et à jour (celui intégré à Windows compte)\u00A0?",
    action: {
      title: "Vérifier l'antivirus de chaque poste",
      why: "Vérifiez que l'antivirus est activé et à jour sur chaque ordinateur.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 14" },
      { ref: "cm10Mesures" },
    ],
  },
  {
    id: "P2",
    theme: "postes",
    weight: 2,
    text: "Pour le travail de tous les jours, utilisez-vous un compte sans droits d'administrateur\u00A0?",
    action: {
      title: "Travailler avec un compte sans droits d'administrateur",
      why: "Travaillez au quotidien avec un compte standard et gardez le compte administrateur pour les installations. Un logiciel malveillant ouvert par erreur aura alors beaucoup moins de pouvoir.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 29" },
      { ref: "cmRancongiciel" },
    ],
  },

  // --- Messagerie et hameçonnage -----------------------------------
  {
    id: "E1",
    theme: "messagerie",
    weight: 2,
    text: "Avant de payer une facture inhabituelle ou de changer un RIB à la demande d'un e-mail, vérifiez-vous par téléphone, avec un numéro que vous connaissiez déjà\u00A0?",
    action: {
      title: "Vérifier par téléphone toute demande de paiement ou de changement de RIB",
      why: "Confirmez toujours ce type de demande par un autre canal. Les escrocs imitent les fournisseurs et les dirigeants pour obtenir de faux virements.",
    },
    sources: [{ ref: "cmHameconnage" }, { ref: "cm5Recos" }],
  },
  {
    id: "E2",
    theme: "messagerie",
    weight: 1,
    text: "Les usages professionnels et personnels sont-ils séparés (adresse mail pro, ordinateur pro non partagé avec la famille)\u00A0?",
    action: {
      title: "Séparer les usages professionnels et personnels",
      why: "Réservez les outils professionnels au travail. Un jeu ou un mail personnel piégé ne doit pas pouvoir toucher les données de la structure.",
    },
    sources: [
      { ref: "cmProPerso" },
      { ref: "anssiHygiene", detail: "mesure 24" },
    ],
  },

  // --- Wi-Fi et accès à distance -----------------------------------
  {
    id: "W1",
    theme: "reseau",
    weight: 2,
    text: "Votre Wi-Fi est-il protégé par un mot de passe solide (celui d'origine de la box a été changé), avec un réseau séparé pour les visiteurs ou les patients\u00A0?",
    action: {
      title: "Sécuriser le Wi-Fi et créer un réseau invités",
      why: "Changez les mots de passe d'origine et activez un réseau «\u00A0invités\u00A0» séparé. Un visiteur ne doit pas se retrouver sur le même réseau que vos ordinateurs.",
    },
    sources: [{ ref: "anssiHygiene", detail: "mesures 12 et 20" }],
  },
  {
    id: "W2",
    theme: "reseau",
    weight: 3,
    text: "Si des accès à distance existent (télétravail, télémaintenance par un prestataire), sont-ils protégés par un VPN et la double authentification\u00A0? Répondez «\u00A0Oui\u00A0» si vous n'en avez aucun.",
    action: {
      title: "Protéger ou fermer les accès à distance",
      why: "Demandez à votre prestataire de protéger ces accès, ou de les fermer s'ils ne servent pas. Un accès à distance mal protégé est une porte d'entrée directe.",
    },
    sources: [{ ref: "cmRancongiciel" }, { ref: "cmTeletravail" }],
  },

  // --- Sensibilisation du personnel --------------------------------
  {
    id: "H1",
    theme: "equipe",
    weight: 2,
    text: "Votre équipe a-t-elle été sensibilisée récemment aux bons réflexes (messages piégés, mots de passe, à qui signaler un doute)\u00A0?",
    action: {
      title: "Sensibiliser votre équipe aux bons réflexes",
      why: "Organisez une courte séance avec les ressources gratuites de Cybermalveillance.gouv.fr. Un message piégé repéré à temps évite la plupart des ennuis.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 2" },
      { ref: "cmHameconnage" },
    ],
  },

  // --- Réaction en cas d'incident ----------------------------------
  {
    id: "I1",
    theme: "incident",
    weight: 2,
    text: "En cas d'attaque, savez-vous quoi faire en premier et qui appeler (prestataire, 17Cyber, assureur), et ces informations sont-elles notées quelque part, accessibles même sans ordinateur\u00A0?",
    action: {
      title: "Préparer la marche à suivre en cas d'attaque",
      why: "Imprimez la page «\u00A0En cas d'attaque\u00A0» de ce site et rangez-la à portée de main. Les premières minutes comptent\u00A0: débrancher du réseau, ne pas payer la rançon, appeler de l'aide.",
    },
    sources: [
      { ref: "anssiHygiene", detail: "mesure 40" },
      { ref: "cmRancongiciel" },
    ],
  },
];
