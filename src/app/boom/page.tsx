/**
 * Route de démonstration : déclenche volontairement la frontière d'erreur
 * (`app/error.tsx`) en levant une exception au rendu. Sert à illustrer la
 * gestion d'erreur de l'App Router. À ne pas exposer en production réelle.
 */

// Rendu dynamique forcé : sans ça, `next build` tente de prérendre la page
// statiquement, l'exception est alors levée au build et fait échouer la
// compilation. L'erreur ne doit survenir qu'à l'exécution (frontière d'erreur).
export const dynamic = "force-dynamic";

export default function Boom(): never {
    throw new Error("Test de la frontière d'erreur");
}
