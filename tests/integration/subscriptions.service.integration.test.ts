import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {prisma} from "@/prisma";
import {subscriptionsService} from "@/src/lib/subscriptions/subscriptions.service";
import {getCurrentUserId} from "@/src/lib/auth";
import {resetDb, seedTopic, seedUser} from "./db-utils";

vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

beforeEach(resetDb);
afterAll(async () => {
    await prisma.$disconnect();
});

describe("SubscriptionsService (integration)", () => {
    it("subscribeTopic should not duplicate when called twice (a second subscription stays single)", async () => {
        const user = await seedUser();
        const topic = await seedTopic();
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        await subscriptionsService.subscribeTopic(topic.id);
        await subscriptionsService.subscribeTopic(topic.id); // ne doit pas lever

        expect(await prisma.subscription.count()).toBe(1);
    });

    it("unsubscribeTopic should remove the subscription and tolerate an absent one", async () => {
        const user = await seedUser();
        const topic = await seedTopic();
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        await subscriptionsService.subscribeTopic(topic.id);
        await subscriptionsService.unsubscribeTopic(topic.id);
        await subscriptionsService.unsubscribeTopic(topic.id); // déjà absent, ne doit pas lever

        expect(await prisma.subscription.count()).toBe(0);
    });
});
