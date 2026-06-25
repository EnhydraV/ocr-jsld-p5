import {prisma} from "@/prisma";
import {Prisma} from "@prisma/client";

/**
 * Accès aux commentaires en base. Aucune logique métier ici : uniquement des
 * requêtes Prisma.
 */
export const commentsRepository = {
    /**
     * Crée un commentaire.
     *
     * `authorId` / `articleId` sont déjà en main (id de session + article visé),
     * d'où `UncheckedCreateInput` plutôt que des `connect` imbriqués.
     * @param data - Données du commentaire, ids de relations inclus.
     */
    insert: (data: Prisma.CommentUncheckedCreateInput) =>
        prisma.comment.create({data}),

}