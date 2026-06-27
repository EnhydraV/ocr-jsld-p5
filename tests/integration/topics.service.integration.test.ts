import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {prisma} from "@/prisma";
import {topicsService} from "@/src/lib/topics/topics.service";
import {getCurrentUserId} from "@/src/lib/auth";
import {resetDb, seedSubscription, seedTopic, seedUser} from "./db-utils";

vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

beforeEach(resetDb);
afterAll(async () => {
    await prisma.$disconnect();
});

describe("TopicsService (integration)", () => {
    it("getAllTopics should list every topic sorted by name", async () => {
        await seedTopic("Rust");
        await seedTopic("Go");

        const topics = await topicsService.getAllTopics();

        expect(topics.map((t) => t.name)).toEqual(["Go", "Rust"]);
    });

    it("getTopicsWithSubscription should flag the topics the user follows", async () => {
        const user = await seedUser();
        const followed = await seedTopic("Go");
        await seedTopic("Rust");
        await seedSubscription(user.id, followed.id);
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        const topics = await topicsService.getTopicsWithSubscription();

        expect(topics.find((t) => t.name === "Go")?.isSubscribed).toBe(true);
        expect(topics.find((t) => t.name === "Rust")?.isSubscribed).toBe(false);
    });
});
