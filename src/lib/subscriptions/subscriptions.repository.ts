import {prisma} from "@/prisma";

export const subscriptionsRepository = {
    subscribe: (userId: number, topicId: number) => prisma.subscription.upsert({
        where: {userId_topicId: {userId, topicId}},
        create: {topicId, userId},
        update: {}
    }),
    unsubscribe: (userId: number, topicId: number) => prisma.subscription.deleteMany({
        where: {userId, topicId}
    }),

}