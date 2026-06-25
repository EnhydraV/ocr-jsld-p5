"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { usersService } from "@/src/lib/users/users.service";
import { AppError } from "@/src/errors/AppError";

/**
 * État renvoyé par {@link registerAction} à `useActionState`.
 * @property error - Message d'erreur à afficher (absent si succès).
 * @property values - Saisies à réinjecter dans le formulaire après un échec.
 */
export type RegisterState = {
    error?: string;
    values?: { username: string; email: string };
};

/**
 * Server Action d'inscription. Les erreurs *attendues* sont retournées dans
 * l'état (validation Zod, conflit métier `AppError`, ou message générique pour
 * l'inattendu) plutôt que jetées ; le `redirect` final est volontairement hors
 * du `try/catch` (il fonctionne en levant une exception interceptée par Next).
 * @param _prev - État précédent (imposé par `useActionState`, non utilisé ici).
 * @param formData - Données du formulaire d'inscription.
 * @returns Le nouvel état : message d'erreur + valeurs saisies, ou redirection.
 */
export async function registerAction(
    _prev: RegisterState,
    formData: FormData,
): Promise<RegisterState> {
    // Saisies conservées pour re-remplir le formulaire en cas d'échec
    const values = {
        username: String(formData.get("username") ?? ""),
        email: String(formData.get("email") ?? ""),
    };

    try {
        await usersService.register({
            ...values,
            password: String(formData.get("password") ?? ""),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message, values };
        }
        if (error instanceof AppError) {
            return { error: error.message, values };
        }
        console.error("registerAction:", error);
        return { error: "Une erreur interne est survenue. Réessaie plus tard.", values };
    }

    redirect("/login?registered=1");
}
