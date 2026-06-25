import {z} from "zod";

/**
 * Schéma de validation d'un article : titre (5–256 caractères), contenu d'au
 * moins 50 caractères et id de thème positif. Appliqué par
 * `articlesService.addArticle` avant insertion.
 */
export const ArticleSchema = z.object({
    title: z.string().trim().min(5).max(256),
    content: z.string().trim().min(50),
    topicId: z.number().min(1),
});