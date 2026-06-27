import {beforeEach, describe, expect, it, vi} from "vitest";
import prisma from "../../__mocks__/prisma";
import {articlesService} from "@/src/lib/articles/articles.service";
import {getCurrentUserId} from "@/src/lib/auth";

vi.mock("@/prisma", async () => await import("../../__mocks__/prisma"));
vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

const USER_ID = 7;

describe("ArticlesService", () => {
    beforeEach(() => {
        vi.mocked(getCurrentUserId).mockResolvedValue(USER_ID);
    });

    describe("getFeedArticles", () => {
        it("should fetch the feed of the connected user, newest first by default", async () => {
            prisma.article.findMany.mockResolvedValue([]);
            await articlesService.getFeedArticles();

            expect(prisma.article.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {topic: {subscriptions: {some: {userId: USER_ID}}}},
                    orderBy: {createdAt: "desc"},
                }),
            );
        });

        it("should forward the ascending order when asked", async () => {
            prisma.article.findMany.mockResolvedValue([]);
            await articlesService.getFeedArticles("asc");

            expect(prisma.article.findMany).toHaveBeenCalledWith(
                expect.objectContaining({orderBy: {createdAt: "asc"}}),
            );
        });
    });

    describe("getArticleById", () => {
        it("should return the article with its relations", async () => {
            const article = {id: 1, title: "Titre"};
            prisma.article.findUnique.mockResolvedValue(article as never);

            const res = await articlesService.getArticleById(1);

            expect(res).toBe(article);
            expect(prisma.article.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({where: {id: 1}}),
            );
        });

        it("should return null when the article does not exist", async () => {
            prisma.article.findUnique.mockResolvedValue(null);
            expect(await articlesService.getArticleById(999)).toBeNull();
        });
    });

    describe("addArticle", () => {
        const TITLE = "Un titre correct";
        const CONTENT = "x".repeat(50);

        it("should throw a ZodError on invalid input (no insert)", async () => {
            await expect(articlesService.addArticle("abc", CONTENT, 1)).rejects.toThrow();
            expect(prisma.article.create).not.toHaveBeenCalled();
        });

        it("should insert the article with the author taken from the session", async () => {
            prisma.article.create.mockResolvedValue({id: 42} as never);

            const res = await articlesService.addArticle(TITLE, CONTENT, 3);

            expect(res).toEqual({id: 42});
            expect(prisma.article.create).toHaveBeenCalledWith({
                data: {title: TITLE, content: CONTENT, topicId: 3, authorId: USER_ID},
            });
        });
    });

    describe("articleExists", () => {
        it("should return true when the row is found", async () => {
            prisma.article.findUnique.mockResolvedValue({id: 5} as never);
            expect(await articlesService.articleExists(5)).toBe(true);
        });

        it("should return false when the row is missing", async () => {
            prisma.article.findUnique.mockResolvedValue(null);
            expect(await articlesService.articleExists(5)).toBe(false);
        });
    });
});
