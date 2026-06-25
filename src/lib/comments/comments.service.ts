import {commentsRepository} from './comments.repository';
import {getCurrentUserId} from "@/src/lib/auth";
import {CommentSchema} from "@/src/lib/comments/comments.dto";
import {articlesService} from "@/src/lib/articles/articles.service";
import {AppError} from "@/src/errors/AppError";

/**
 * Service des commentaires : orchestre les lectures/écritures du repository et
 * récupère l'identité depuis la session (jamais depuis le client) pour la
 * publication.
 */
class CommentsService {
    constructor(private repo = commentsRepository) {
    }

    /**
     * Publie un commentaire au nom de l'utilisateur connecté.
     * @param articleId - Id de l'article commenté.
     * @param content - Contenu du commentaire.
     * @throws AppError 401 si aucune session valide.
     * @throws AppError 404 si l'article n'existe pas
     */
    async addComment(articleId: number, content: string) {
        // `data` contient déjà `articleId` et `content` validés ; on ajoute
        // l'auteur issu de la session.
        const data = CommentSchema.parse({articleId, content});
        if (!(await articlesService.articleExists(articleId))) {
            throw new AppError(404, "Cet article n'existe pas");
        }
        const userId = await getCurrentUserId();
        return this.repo.insert({...data, authorId: userId});
    }
}

export const commentsService = new CommentsService();

