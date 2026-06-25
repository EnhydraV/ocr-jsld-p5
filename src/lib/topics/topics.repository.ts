import {prisma} from "@/prisma";

/**
 * Accès aux thèmes en base. Aucune logique métier ici : uniquement des
 * requêtes Prisma, triées par nom pour un affichage stable.
 */
export const topicsRepository = {
    /** Tous les thèmes, ordre alphabétique. */
    all: () => prisma.topic.findMany({orderBy: {name: "asc"}}),

    /**
     * Thèmes auxquels un utilisateur est abonné.
     * @param userId - Id de l'utilisateur concerné.
     */
    subscribedTopics: (userId: number) => prisma.topic.findMany({
        where: {subscriptions: {some: {userId}}},
        orderBy: {name: "asc"}
    }),
}