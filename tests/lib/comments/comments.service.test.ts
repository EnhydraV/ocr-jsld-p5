import {beforeEach, describe, expect, it, vi} from "vitest";
import prisma from "../../__mocks__/prisma";
import {commentsService} from "@/src/lib/comments/comments.service";
import {getCurrentUserId} from "@/src/lib/auth";

vi.mock("@/prisma", async () => await import("../../__mocks__/prisma"));
vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

const USER_ID = 9;
const ARTICLE_ID = 4;

describe("CommentsService", () => {
    beforeEach(() => {
        vi.mocked(getCurrentUserId).mockResolvedValue(USER_ID);
    });

    describe("addComment", () => {
        it("should throw a ZodError on empty content (no existence check, no insert)", async () => {
            await expect(commentsService.addComment(ARTICLE_ID, "   ")).rejects.toThrow();
            expect(prisma.comment.create).not.toHaveBeenCalled();
        });

        it("should throw 404 when the target article does not exist", async () => {
            // articlesService.articleExists → prisma.article.findUnique → null
            prisma.article.findUnique.mockResolvedValue(null);

            await expect(commentsService.addComment(ARTICLE_ID, "Bien vu")).rejects.toMatchObject({
                statusCode: 404,
                message: "Cet article n'existe pas",
            });
            expect(prisma.comment.create).not.toHaveBeenCalled();
        });

        it("should insert the comment with the author taken from the session", async () => {
            prisma.article.findUnique.mockResolvedValue({id: ARTICLE_ID} as never);
            prisma.comment.create.mockResolvedValue({id: 1} as never);

            await commentsService.addComment(ARTICLE_ID, "Bien vu");

            expect(prisma.comment.create).toHaveBeenCalledWith({
                data: {articleId: ARTICLE_ID, content: "Bien vu", authorId: USER_ID},
            });
        });
    });
});
