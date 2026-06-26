/**
 * Route de démonstration : déclenche volontairement la frontière d'erreur
 * (`app/error.tsx`) en levant une exception au rendu. Sert à illustrer la
 * gestion d'erreur de l'App Router. À ne pas exposer en production réelle.
 */
export default function Boom(): never {
    throw new Error("Test de la frontière d'erreur");
}
