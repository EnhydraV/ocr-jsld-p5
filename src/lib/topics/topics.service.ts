import {topicsRepository} from './topics.repository';
import {getCurrentUserId} from "@/src/lib/auth";

/**
 * Service des thèmes : orchestre les lectures du repository et récupère
 * l'identité depuis la session (jamais depuis le client).
 */
class TopicsService {
    constructor(private repo = topicsRepository) {
    }

    /** Liste l'intégralité des thèmes disponibles (page « Thèmes »). */
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
}

export const topicsService = new TopicsService();