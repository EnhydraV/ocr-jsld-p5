/**
 * Route jetable de test : déclenche volontairement la frontière d'erreur
 * (`app/error.tsx`) en levant une exception au rendu. À SUPPRIMER après la
 * vérification visuelle.
 */
export default function Boom(): never {
    throw new Error("Test de la frontière d'erreur");
}
