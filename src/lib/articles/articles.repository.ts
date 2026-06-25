import {prisma} from "@/prisma";
import {Prisma} from "@prisma/client";

/**
 * Accès aux articles en base. Les lectures embarquent les relations
 * nécessaires à l'affichage (auteur, thème, commentaires) via `include`.
 */
export const articlesRepository = {
    /**
     * Fil d'un utilisateur : articles des thèmes auxquels il est abonné.
     * @param userId - Id de l'utilisateur dont on construit le fil.
     * @param order - Tri par date de création (`desc` par défaut).
     */
    feed: (userId: number, order: Prisma.SortOrder = "desc") =>
        prisma.article.findMany({
            where: {topic: {subscriptions: {some: {userId}}}},
            orderBy: {createdAt: order},
            include: {
                author: {select: {username: true}},
                topic: {select: {name: true}},
            },
        }),

    /**
     * Un article et son détail complet : auteur, thème et commentaires
     * (eux-mêmes avec leur auteur), triés du plus ancien au plus récent.
     * @param id - Id de l'article recherché.
     */
    findById: (id: number) =>
        prisma.article.findUnique({
            where: {id},
            include: {
                author: {select: {username: true}},
                topic: {select: {name: true}},
                comments: {
                    orderBy: {createdAt: "desc"},
                    include: {author: {select: {username: true}}},
                },
            },
        }),

    exists: (id: number) =>
        prisma.article.findUnique({where: {id}, select: {id: true}}).then(Boolean),

    /**
     * Crée un article.
     *
     * `authorId` / `topicId` sont déjà en main (id de session + thème du
     * formulaire), d'où `UncheckedCreateInput` plutôt que des `connect` imbriqués.
     * @param data - Données de l'article, ids de relations inclus.
     */
    insert: (data: Prisma.ArticleUncheckedCreateInput) => prisma.article.create({data}),
};
