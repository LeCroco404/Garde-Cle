/**
 * Garde-Clé : impression / export PDF, partagé par toutes les pages.
 *
 * Tout bouton portant l'attribut data-imprimer ouvre la boîte d'impression
 * du navigateur. L'utilisateur y choisit son imprimante ou
 * « Enregistrer au format PDF » : aucune bibliothèque nécessaire.
 *
 * Si le bouton a aussi data-nom-fichier, le titre de la page est changé
 * le temps de l'impression : les navigateurs s'en servent comme nom
 * de fichier PDF proposé (ex. « Bilan Garde-Clé 2026-11-04 »).
 */
for (const button of document.querySelectorAll("[data-imprimer]")) {
  button.addEventListener("click", () => {
    const nom = button.dataset.nomFichier;
    if (nom) {
      const titreOriginal = document.title;
      const date = new Date().toLocaleDateString("fr-CA"); // format AAAA-MM-JJ
      document.title = `${nom} ${date}`;
      window.addEventListener("afterprint", () => (document.title = titreOriginal), { once: true });
    }
    window.print();
  });
}
