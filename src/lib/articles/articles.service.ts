import {articlesRepository} from './articles.repository';
import {getCurrentUserId} from "@/src/lib/auth";
import {Prisma} from "@prisma/client";
import {ArticleSchema} from "@/src/lib/articles/articles.dto";

/**
 * Service des articles : orchestre les lectures/écritures du repository et
 * récupère l'identité depuis la session (jamais depuis le client) pour les
 * opérations qui en dépendent.
 */
class ArticlesService {
    constructor(private repo = articlesRepository) {
    }

    /**
     * Fil de l'utilisateur connecté : articles des thèmes qu'il suit.
     * @param order - Tri par date de création (`desc` par défaut).
     * @throws AppError 401 si aucune session valide.
     */
    async getFeedArticles(order: Prisma.SortOrder = "desc") {
        const userId = await getCurrentUserId();
        return this.repo.feed(userId, order);
    }

    /**
     * Détail d'un article (auteur, thème, commentaires).
     * @param id - Id de l'article recherché.
     * @returns L'article et ses relations, ou `null` s'il n'existe pas.
     */
    async getArticleById(id: number) {
        return this.repo.findById(id);
    }

    /**
     * Publie un article au nom de l'utilisateur connecté.
     * @param title - Titre de l'article.
     * @param content - Contenu de l'article.
     * @param topicId - Id du thème auquel rattacher l'article.
     * @throws AppError 401 si aucune session valide.
     */
    async addArticle(title: string, content: string, topicId: number) {
        const data = ArticleSchema.parse({title, content, topicId});
        const userId = await getCurrentUserId();
        return this.repo.insert({...data, authorId: userId});
    }

    async articleExists(id: number) {
        return this.repo.exists(id);
    }
}

export const articlesService = new ArticlesService();