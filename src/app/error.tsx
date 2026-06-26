'use client';

import {useEffect} from 'react';

/**
 * Frontière d'erreur de l'App Router (`error.tsx`). Capture les erreurs de
 * rendu des routes et propose de réessayer. Doit être un Client Component.
 *
 * Le rendu est calqué sur `not-found.tsx` pour une cohérence visuelle entre
 * les pages d'état (centrage plein écran, bloc centré, bouton primaire).
 * @param error - L'erreur interceptée (avec un éventuel `digest` côté serveur).
 * @param reset - Tente de re-rendre le segment qui a échoué.
 */
export default function Error({error, reset,}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Journalisation possible vers un service de suivi d'erreurs
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="text-center space-y-6">
                <div className="text-8xl font-bold text-primary">Oups</div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Quelque chose s&apos;est mal passé
                </h1>
                <p className="text-foreground max-w-md">
                    Une erreur inattendue est survenue. Vous pouvez réessayer.
                </p>
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        </div>
    );
}
