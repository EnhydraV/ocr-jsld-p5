import {subscriptionsRepository} from './subscriptions.repository';
import {getCurrentUserId} from "@/src/lib/auth";

class SubscriptionsService {
    constructor(private repo = subscriptionsRepository) {
    }

    async subscribeTopic(topicId: number) {
        const userId=await getCurrentUserId();
        await this.repo.subscribe(userId, topicId);
    }

    async unsubscribeTopic(topicId: number) {
        const userId=await getCurrentUserId();
        await this.repo.unsubscribe(userId, topicId);
    }
}

export const subscriptionsService = new SubscriptionsService();