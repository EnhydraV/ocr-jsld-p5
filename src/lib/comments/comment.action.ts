"use server";

import {redirect} from "next/navigation";
import {toActionError, type ActionState} from "@/src/lib/actionError";
import {commentsService} from "@/src/lib/comments/comments.service";

/**
 * État renvoyé par {@link commentAction} à `useActionState` : message d'erreur
 * éventuel et contenu à réinjecter dans le formulaire après un échec.
 */
export type CommentState = ActionState<{content: string}>;

/**
 * Server Action de publication d'un commentaire. `articleId` vient du contexte
 * de page et est passé via `commentAction.bind(null, articleId)` : il est signé
 * par Next (non modifiable dans le DOM, contrairement à un champ caché) et
 * n'apparaît donc pas dans `formData`.
 *
 * Les erreurs *attendues* (validation Zod, `AppError` 401/404) sont traduites en
 * état d'erreur via {@link toActionError} ; le `redirect` final est volontairement
 * hors du `try/catch` (l'exception `NEXT_REDIRECT` qu'il lève serait sinon avalée
 * par le `catch`).
 * @param articleId - Id de l'article commenté (argument lié via `.bind()`).
 * @param _prev - État précédent (imposé par `useActionState`, non utilisé ici).
 * @param formData - Données du formulaire de commentaire (`content`).
 * @returns Le nouvel état : message d'erreur + contenu saisi, ou redirection.
 */
export async function commentAction(
    articleId: number,
    _prev: CommentState,
    formData: FormData,
): Promise<CommentState> {
    // Saisie conservée pour re-remplir le formulaire en cas d'échec
    const values = {
        content: String(formData.get("content") ?? ""),
    };

    try {
        await commentsService.addComment(articleId, values.content);
    } catch (error) {
        return toActionError(error, values, "commentAction");
    }

    redirect(`/article/${articleId}?comment=1`);
}
