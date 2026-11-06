# Garde-Clé

Autodiagnostic de cybersécurité gratuit pour les petites structures sans service
informatique : cabinets médicaux, associations, TPE.

En une dizaine de minutes, l'utilisateur répond à 15 questions simples et obtient un
score de maturité sur 100, un score par thème et les 5 actions à mener en priorité,
expliquées sans jargon, chacune avec sa source officielle.

**Site en ligne :** <https://garde-cle.netlify.app>

## Fonctionnalités

- Questionnaire de 15 questions en 8 thèmes : sauvegardes, mots de passe et double
  authentification, mises à jour, postes et antivirus, messagerie et hameçonnage,
  Wi-Fi et accès à distance, sensibilisation, réaction en cas d'incident.
- Quatre réponses possibles : Oui, En partie, Non, Je ne sais pas.
- Score pondéré selon la gravité du risque, niveau (critique, à améliorer, correct,
  bon) et 5 actions prioritaires classées par impact.
- Export du bilan en PDF ou impression, pour le garder ou le montrer à un prestataire.
- Page « En cas d'attaque » : premiers réflexes et contacts utiles (17Cyber, dépôt de
  plainte, CNIL), imprimable sur 2 pages.
- Accessible au clavier et aux lecteurs d'écran, responsive, mode sombre.

## Confidentialité par conception

Aucune réponse ne quitte le navigateur, et ce n'est pas seulement une promesse :

- les réponses vivent dans une variable JavaScript en mémoire, sans `localStorage`,
  cookie ni compte : recharger la page efface tout ;
- aucune ressource externe (ni police, ni CDN, ni mesure d'audience) ;
- une Content Security Policy, en balise `<meta>` dans chaque page et en en-tête HTTP
  via `_headers`, contient `connect-src 'none'` : le navigateur refuse toute requête
  réseau émise par le JavaScript ;
- les textes sont insérés avec `textContent`, jamais `innerHTML` (pas d'injection
  de code possible).

## Méthode de calcul

| Réponse | Valeur |
|---|---|
| Oui | 1 |
| En partie | 0,5 |
| Non | 0 |
| Je ne sais pas | 0 |

Chaque question a un poids de 1 (utile), 2 (important) ou 3 (critique).

- **Score** = somme (poids × valeur) / somme des poids × 100, arrondi.
- **Niveaux** : critique < 40 ≤ à améliorer < 60 ≤ correct < 80 ≤ bon.
- **Garde-fou** : si une question de poids 3 reçoit Non ou Je ne sais pas, le niveau
  est plafonné à « à améliorer ».
- **Actions prioritaires** : impact = poids × (1 − valeur) ; en cas d'égalité, le poids
  le plus fort puis l'ordre du questionnaire.

Les poids et les seuils sont des choix de conception de l'outil, pas des normes
officielles.

## Sources

Toutes les recommandations s'appuient sur des sources officielles françaises :

- [ANSSI, Guide d'hygiène informatique](https://messervices.cyber.gouv.fr/guides/guide-dhygiene-informatique)
- [Cybermalveillance.gouv.fr](https://www.cybermalveillance.gouv.fr/) : bonnes pratiques et fiches réflexes
- [CNIL, Notifier une violation de données personnelles](https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles)

## Structure du projet

```
├── index.html              Accueil, questionnaire et résultats
├── en-cas-d-attaque.html   Premiers réflexes et contacts (fonctionne sans JavaScript)
├── a-propos.html           Méthode, sources, confidentialité, limites
├── css/
│   ├── base.css            Police, couleurs, typographie, mise en page, en-tête, pied de page
│   ├── composants.css      Boutons, réponses, tampon du niveau, listes, tableaux
│   └── print.css           Mise en page d'impression / PDF
├── js/
│   ├── app.js              Navigation dans le questionnaire
│   ├── scoring.js          Calcul des scores (fonctions pures)
│   ├── results.js          Affichage des résultats
│   ├── print.js            Bouton d'impression
│   └── data/questions.js   Contenu : questions, poids, recommandations, sources
├── tests/scoring.test.js   Tests du calcul et du contenu
├── assets/favicon.svg
├── polices/                Atkinson Hyperlegible Next, auto-hébergée (licence SIL OFL)
└── _headers                En-têtes de sécurité HTTP (Netlify)
```

Le contenu est séparé de la logique : modifier une question ou une source ne
demande de toucher qu'à `js/data/questions.js`.

## Lancer en local

Aucune installation n'est nécessaire. Les modules JavaScript exigent toutefois un
serveur (ils sont bloqués en ouvrant le fichier directement) :

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

## Tests

Les tests utilisent le lanceur intégré à Node.js (version 18 ou plus), sans dépendance :

```bash
npm test
```

Ils couvrent la valeur des réponses, le score pondéré, les seuils de niveau, le
garde-fou, l'ordre des actions prioritaires, la gestion d'un questionnaire incomplet
et la cohérence du contenu (thèmes, poids, sources officielles en HTTPS).

## Accessibilité

Objectif : WCAG 2.2 niveau AA.

- Audit automatique axe-core sur toutes les pages et étapes, en mode clair et sombre :
  aucune violation.
- Navigation complète au clavier, lien d'évitement, focus visible.
- Questions en `fieldset` / `legend`, boutons radio natifs, focus déplacé sur chaque
  nouvelle question pour les lecteurs d'écran.
- Contrastes AA, niveau toujours écrit en toutes lettres (la couleur n'est jamais le
  seul repère), cibles tactiles d'au moins 44 px, respect de « réduire les animations ».

## Déploiement

Site statique, sans étape de build. Sur Netlify : importer le dépôt, laisser la
commande de build vide et indiquer `.` comme dossier de publication. Le fichier
`_headers` est appliqué automatiquement.

## Limites

Ce diagnostic est indicatif. Il porte sur 15 points essentiels et ne remplace ni un
audit, ni l'accompagnement d'un professionnel. Outil indépendant, non affilié à
l'ANSSI, à Cybermalveillance.gouv.fr ni à la CNIL.

## Licence

Code : [MIT](LICENSE). Police Atkinson Hyperlegible Next : SIL Open Font License 1.1
([polices/OFL.txt](polices/OFL.txt)).
