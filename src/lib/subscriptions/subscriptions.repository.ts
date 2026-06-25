import {prisma} from "@/prisma";

/**
 * Accès aux abonnements (table de jointure utilisateur ↔ thème).
 * Les deux opérations sont idempotentes : réémettre la même requête ne casse rien.
 */
export const subscriptionsRepository = {
    /**
     * Abonne un utilisateur à un thème. `upsert` sur la clé composite
     * `userId_topicId` : un double abonnement ne lève pas d'erreur.
     */
    subscribe: (userId: number, topicId: number) => prisma.subscription.upsert({
        where: {userId_topicId: {userId, topicId}},
        create: {topicId, userId},
        update: {}
    }),

    /**
     * Désabonne un utilisateur d'un thème. `deleteMany` plutôt que `delete`
     * pour ne pas lever d'erreur si la ligne n'existe pas.
     */
    unsubscribe: (userId: number, topicId: number) => prisma.subscription.deleteMany({
        where: {userId, topicId}
    }),

}