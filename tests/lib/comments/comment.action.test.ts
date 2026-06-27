import {beforeEach, describe, expect, it, vi} from "vitest";
import {redirect} from "next/navigation";
import {commentAction, type CommentState} from "@/src/lib/comments/comment.action";
import {commentsService} from "@/src/lib/comments/comments.service";
import {AppError} from "@/src/errors/AppError";

vi.mock("next/navigation", () => ({redirect: vi.fn()}));
vi.mock("@/src/lib/comments/comments.service", () => ({
    commentsService: {addComment: vi.fn()},
}));

const ARTICLE_ID = 7;
const EMPTY: CommentState = {};

function formData(content: string) {
    const fd = new FormData();
    fd.set("content", content);
    return fd;
}

describe("commentAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should add the comment then redirect back to the article", async () => {
        vi.mocked(commentsService.addComment).mockResolvedValue({} as never);

        // articleId est lié via .bind() : ici on le passe directement comme 1er argument.
        await commentAction(ARTICLE_ID, EMPTY, formData("Bien vu !"));

        expect(commentsService.addComment).toHaveBeenCalledWith(ARTICLE_ID, "Bien vu !");
        expect(redirect).toHaveBeenCalledWith("/article/7?comment=1");
    });

    it("should return the error state and keep the content on failure", async () => {
        vi.mocked(commentsService.addComment).mockRejectedValue(new AppError(404, "Cet article n'existe pas"));

        const state = await commentAction(ARTICLE_ID, EMPTY, formData("Bien vu !"));

        expect(state).toEqual({error: "Cet article n'existe pas", values: {content: "Bien vu !"}});
        expect(redirect).not.toHaveBeenCalled();
    });
});
