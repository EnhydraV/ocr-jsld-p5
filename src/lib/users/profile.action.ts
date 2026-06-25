"use server";

import { usersService } from "@/src/lib/users/users.service";
import { toActionError, type ActionState } from "@/src/lib/actionError";
import {revalidatePath} from "next/cache";

/**
 * État renvoyé par {@link profileAction} à `useActionState` : message d'erreur
 * éventuel, saisies à réinjecter après un échec, et drapeau de succès pour
 * afficher une confirmation.
 */
export type ProfileState = ActionState<{ username: string; email: string }> & {
    success?: boolean;
};

/**
 * Server Action de mise à jour du profil de l'utilisateur connecté. Les erreurs
 * *attendues* (validation Zod, `AppError`) sont traduites en état d'erreur via
 * {@link toActionError}. En cas de succès, on **reste sur la page** : pas de
 * `redirect`, mais un `revalidatePath('/profile')` pour rafraîchir les données
 * affichées, et un état `success` renvoyé pour la confirmation.
 * @param _prev - État précédent (imposé par `useActionState`, non utilisé ici).
 * @param formData - Données du formulaire de profil (`username`, `email`, `password`).
 * @returns Le nouvel état : erreur + saisies, ou succès.
 */
export async function profileAction(
    _prev: ProfileState,
    formData: FormData,
): Promise<ProfileState> {
    // Saisies conservées pour re-remplir le formulaire en cas d'échec
    const values = {
        username: String(formData.get("username") ?? ""),
        email: String(formData.get("email") ?? ""),
    };

    try {
        await usersService.updateProfile({
            ...values,
            password: String(formData.get("password") ?? ""),
        });
    } catch (error) {
        return toActionError(error, values, "profileAction");
    }

    revalidatePath("/profile");
    return {success: true, values};
}
