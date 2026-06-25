"use server";

import { redirect } from "next/navigation";
import { usersService } from "@/src/lib/users/users.service";
import { toActionError, type ActionState } from "@/src/lib/actionError";

/**
 * État renvoyé par {@link registerAction} à `useActionState` : message d'erreur
 * éventuel et saisies à réinjecter dans le formulaire après un échec.
 */
export type RegisterState = ActionState<{ username: string; email: string }>;

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
) {
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
        return toActionError(error, values, "registerAction");
    }

    redirect("/login?registered=1");
}
