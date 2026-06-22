import {prisma} from "@/prisma";

export const topicsRepository = {
    all: () => prisma.topic.findMany({orderBy: {name: "asc"}}),
    subscribedTopics: (userId: number) => prisma.topic.findMany({
        where: {subscriptions: {some: {userId}}},
        orderBy: {name: "asc"}
    }),
}