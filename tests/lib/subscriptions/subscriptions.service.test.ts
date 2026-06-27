import {beforeEach, describe, expect, it, vi} from "vitest";
import prisma from "../../__mocks__/prisma";
import {subscriptionsService} from "@/src/lib/subscriptions/subscriptions.service";
import {getCurrentUserId} from "@/src/lib/auth";

vi.mock("@/prisma", async () => await import("../../__mocks__/prisma"));
vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

const USER_ID = 11;
const TOPIC_ID = 3;

describe("SubscriptionsService", () => {
    beforeEach(() => {
        vi.mocked(getCurrentUserId).mockResolvedValue(USER_ID);
    });

    it("should subscribe the connected user via an upsert (no error if already subscribed)", async () => {
        prisma.subscription.upsert.mockResolvedValue({} as never);

        await subscriptionsService.subscribeTopic(TOPIC_ID);

        expect(prisma.subscription.upsert).toHaveBeenCalledWith({
            where: {userId_topicId: {userId: USER_ID, topicId: TOPIC_ID}},
            create: {topicId: TOPIC_ID, userId: USER_ID},
            update: {},
        });
    });

    it("should unsubscribe the connected user via deleteMany (no error if absent)", async () => {
        prisma.subscription.deleteMany.mockResolvedValue({count: 1} as never);

        await subscriptionsService.unsubscribeTopic(TOPIC_ID);

        expect(prisma.subscription.deleteMany).toHaveBeenCalledWith({
            where: {userId: USER_ID, topicId: TOPIC_ID},
        });
    });
});
