import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {prisma} from "@/prisma";
import {commentsService} from "@/src/lib/comments/comments.service";
import {getCurrentUserId} from "@/src/lib/auth";
import {resetDb, seedArticle, seedTopic, seedUser} from "./db-utils";

vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

beforeEach(resetDb);
afterAll(async () => {
    await prisma.$disconnect();
});

describe("CommentsService (integration)", () => {
    it("addComment should persist a comment on an existing article", async () => {
        const user = await seedUser();
        const topic = await seedTopic();
        const article = await seedArticle(user.id, topic.id);
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        await commentsService.addComment(article.id, "Bien vu");

        const stored = await prisma.comment.findMany({where: {articleId: article.id}});
        expect(stored).toHaveLength(1);
        expect(stored[0].content).toBe("Bien vu");
        expect(stored[0].authorId).toBe(user.id);
    });

    it("addComment should throw 404 when the article does not exist", async () => {
        const user = await seedUser();
        vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

        await expect(commentsService.addComment(99999, "Fantôme")).rejects.toMatchObject({statusCode: 404});
        expect(await prisma.comment.count()).toBe(0);
    });
});
