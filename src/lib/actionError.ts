import {z} from "zod";
import {AppError} from "@/src/errors/AppError";

/** État commun renvoyé par les Server Actions à `useActionState`. */
export type ActionState<V> = {
    error?: string;
    values?: V;
};

/**
 * Traduit une erreur d'action en état d'erreur affichable. Centralise le tri
 * Zod (premier message du schéma) / `AppError` (message métier) / inattendu
 * (loggé côté serveur + message générique).
 *
 * Les services restent agnostiques : ils *jettent* `AppError` / `ZodError`,
 * c'est la couche transport (Server Action) qui les traduit ici.
 * @param error - L'erreur attrapée.
 * @param values - Saisies à réinjecter dans le formulaire après l'échec.
 * @param context - Étiquette de log pour l'erreur inattendue.
 * @returns L'état d'erreur typé à renvoyer à `useActionState`.
 */
export function toActionError<V>(error: unknown, values: V, context: string): ActionState<V> {
    if (error instanceof z.ZodError) {
        return {error: error.issues[0].message, values};
    }
    if (error instanceof AppError) {
        return {error: error.message, values};
    }
    console.error(`${context}:`, error);
    return {error: "Une erreur interne est survenue. Réessaie plus tard.", values};
}
