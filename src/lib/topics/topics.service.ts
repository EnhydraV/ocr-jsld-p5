import {topicsRepository} from './topics.repository';
import {getCurrentUserId} from "@/src/lib/auth";

/**
 * Service des thèmes : orchestre les lectures du repository et récupère
 * l'identité depuis la session (jamais depuis le client).
 */
class TopicsService {
    constructor(private repo = topicsRepository) {
    }

    /**
     * Liste l'intégralité des thèmes, sans état d'abonnement. Destiné au menu
     * déroulant de thème du formulaire de rédaction d'article (la page « Thèmes »,
     * elle, utilise {@link getTopicsWithSubscription} pour le flag « abonné »).
     */
    async getAllTopics() {
        return this.repo.all();
    }

    /**
     * Liste les thèmes suivis par l'utilisateur connecté (page profil).
     * @throws AppError 401 si aucune session valide.
     */
    async getSubscribedTopics() {
        const userId = await getCurrentUserId();
        return this.repo.subscribedTopics(userId);
    }

    /**
     * Liste tous les thèmes avec, pour chacun, un drapeau `isSubscribed` indiquant
     * si l'utilisateur connecté y est abonné (page « Thèmes »). La relation
     * `subscriptions` chargée par le repository est résolue en booléen ici.
     * @throws AppError 401 si aucune session valide.
     */
    async getTopicsWithSubscription() {
        const userId = await getCurrentUserId();
        const topics = await this.repo.allWithSubscription(userId);
        return topics.map(({subscriptions, ...topic}) => ({
            ...topic,
            isSubscribed: subscriptions.length > 0,
        }));
    }
}

export const topicsService = new TopicsService();