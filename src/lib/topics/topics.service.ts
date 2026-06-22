import {topicsRepository} from './topics.repository';
import {getCurrentUserId} from "@/src/lib/auth";

class TopicsService {
    constructor(private repo = topicsRepository) {
    }

    async getAllTopics() {
        return this.repo.all();
    }

    async getSubscribedTopics() {
        const userId = await getCurrentUserId();
        return this.repo.subscribedTopics(userId);
    }
}

export const topicsService = new TopicsService();