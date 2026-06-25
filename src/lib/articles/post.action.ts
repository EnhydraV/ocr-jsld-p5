"use server";

import {redirect} from "next/navigation";
import {articlesService} from "@/src/lib/articles/articles.service";
import {toActionError, type ActionState} from "@/src/lib/actionError";

/**
 * État renvoyé par {@link postAction} à `useActionState` : message d'erreur
 * éventuel et saisies à réinjecter dans le formulaire après un échec.
 */
export type PostState = ActionState<{topicId: number; title: string; content: string}>;

/**
 * Server Action de publication d'un article. Les erreurs *attendues* (validation
 * Zod, conflit métier `AppError`) sont traduites en état d'erreur via
 * {@link toActionError} ; le `redirect` final est volontairement hors du
 * `try/catch` (il fonctionne en levant une exception interceptée par Next, qui
 * serait sinon avalée par le `catch`).
 * @param _prev - État précédent (imposé par `useActionState`, non utilisé ici).
 * @param formData - Données du formulaire de publication.
 * @returns Le nouvel état : message d'erreur + valeurs saisies, ou redirection.
 */
export async function postAction(
    _prev: PostState,
    formData: FormData,
): Promise<PostState> {
    // Saisies conservées pour re-remplir le formulaire en cas d'échec
    const values = {
        topicId: Number(formData.get("topicId") ?? 0),
        title: String(formData.get("title") ?? ""),
        content: String(formData.get("content") ?? ""),
    };

    let articleId: number;
    try {
        const created = await articlesService.addArticle(values.title, values.content, values.topicId);
        articleId = created.id;
    } catch (error) {
        return toActionError(error, values, "postAction");
    }

    redirect(`/article/${articleId}?created=1`);
}
