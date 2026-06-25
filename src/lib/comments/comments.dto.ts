import {z} from "zod";

/**
 * Schéma de validation d'un commentaire : contenu non vide et id d'article
 * positif. Appliqué par `commentsService.addComment` avant insertion.
 */
export const CommentSchema = z.object({
    content: z.string().trim().min(1),
    articleId: z.number().min(1),
});