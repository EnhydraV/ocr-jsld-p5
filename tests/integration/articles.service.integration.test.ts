import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {prisma} from "@/prisma";
import {articlesService} from "@/src/lib/articles/articles.service";
import {getCurrentUserId} from "@/src/lib/auth";
import {resetDb, seedArticle, seedSubscription, seedTopic, seedUser} from "./db-utils";

vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

beforeEach(resetDb);
afterAll(async () => {
    await prisma.$disconnect();
});

describe("ArticlesService (integration)", () => {
    it("addArticle should persist an article authored by the connected user", async () => {
        const user = await seedUser();
        const topic = await seedTopic();
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        const created = await articlesService.addArticle("Un titre correct", "x".repeat(50), topic.id);

        const stored = await prisma.article.findUniqueOrThrow({where: {id: created.id}});
        expect(stored.authorId).toBe(user.id);
        expect(stored.topicId).toBe(topic.id);
    });

    it("getFeedArticles should only return articles from subscribed topics", async () => {
        const user = await seedUser();
        const followed = await seedTopic("Go");
        const ignored = await seedTopic("Rust");
        await seedSubscription(user.id, followed.id);
        await seedArticle(user.id, followed.id, "Dans le fil");
        await seedArticle(user.id, ignored.id, "Hors du fil");
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        const feed = await articlesService.getFeedArticles();

        expect(feed).toHaveLength(1);
        expect(feed[0].title).toBe("Dans le fil");
    });

    it("getArticleById should include author, topic and comments", async () => {
        const user = await seedUser();
        const topic = await seedTopic();
        const article = await seedArticle(user.id, topic.id);
        await prisma.comment.create({data: {authorId: user.id, articleId: article.id, content: "Top"}});

        const res = await articlesService.getArticleById(article.id);

        expect(res?.author.username).toBe(user.username);
        expect(res?.topic.name).toBe(topic.name);
        expect(res?.comments).toHaveLength(1);
    });
});
