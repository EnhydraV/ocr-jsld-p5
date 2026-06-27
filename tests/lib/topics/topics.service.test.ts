import {beforeEach, describe, expect, it, vi} from "vitest";
import prisma from "../../__mocks__/prisma";
import {topicsService} from "@/src/lib/topics/topics.service";
import {getCurrentUserId} from "@/src/lib/auth";

vi.mock("@/prisma", async () => await import("../../__mocks__/prisma"));
vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

const USER_ID = 13;

describe("TopicsService", () => {
    beforeEach(() => {
        vi.mocked(getCurrentUserId).mockResolvedValue(USER_ID);
    });

    describe("getAllTopics", () => {
        it("should list every topic sorted by name, without subscription state", async () => {
            const topics = [{id: 1, name: "Go"}];
            prisma.topic.findMany.mockResolvedValue(topics as never);

            expect(await topicsService.getAllTopics()).toBe(topics);
            expect(prisma.topic.findMany).toHaveBeenCalledWith({orderBy: {name: "asc"}});
        });
    });

    describe("getSubscribedTopics", () => {
        it("should list only the topics followed by the connected user", async () => {
            prisma.topic.findMany.mockResolvedValue([] as never);

            await topicsService.getSubscribedTopics();

            expect(prisma.topic.findMany).toHaveBeenCalledWith({
                where: {subscriptions: {some: {userId: USER_ID}}},
                orderBy: {name: "asc"},
            });
        });
    });

    describe("getTopicsWithSubscription", () => {
        it("should resolve the loaded subscriptions relation into an isSubscribed boolean", async () => {
            prisma.topic.findMany.mockResolvedValue([
                {id: 1, name: "Go", subscriptions: [{userId: USER_ID}]}, // abonné
                {id: 2, name: "Rust", subscriptions: []}, // non abonné
            ] as never);

            const res = await topicsService.getTopicsWithSubscription();

            expect(res).toEqual([
                {id: 1, name: "Go", isSubscribed: true},
                {id: 2, name: "Rust", isSubscribed: false},
            ]);
            // La relation `subscriptions` ne doit pas fuiter dans le résultat exposé.
            expect(res[0]).not.toHaveProperty("subscriptions");
        });
    });
});
