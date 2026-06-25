import {subscriptionsRepository} from './subscriptions.repository';
import {getCurrentUserId} from "@/src/lib/auth";

/**
 * Service des abonnements. L'utilisateur agit toujours sur ses propres
 * abonnements : l'id vient de la session, jamais d'un paramètre client.
 */
class SubscriptionsService {
    constructor(private repo = subscriptionsRepository) {
    }

    /**
     * Abonne l'utilisateur connecté à un thème.
     * @param topicId - Id du thème ciblé.
     * @throws AppError 401 si aucune session valide.
     */
    async subscribeTopic(topicId: number) {
        const userId=await getCurrentUserId();
        await this.repo.subscribe(userId, topicId);
    }

    /**
     * Désabonne l'utilisateur connecté d'un thème.
     * @param topicId - Id du thème ciblé.
     * @throws AppError 401 si aucune session valide.
     */
    async unsubscribeTopic(topicId: number) {
        const userId=await getCurrentUserId();
        await this.repo.unsubscribe(userId, topicId);
    }
}

export const subscriptionsService = new SubscriptionsService();