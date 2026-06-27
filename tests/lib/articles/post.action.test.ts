import {beforeEach, describe, expect, it, vi} from "vitest";
import {redirect} from "next/navigation";
import {postAction, type PostState} from "@/src/lib/articles/post.action";
import {articlesService} from "@/src/lib/articles/articles.service";
import {AppError} from "@/src/errors/AppError";

vi.mock("next/navigation", () => ({redirect: vi.fn()}));
vi.mock("@/src/lib/articles/articles.service", () => ({
    articlesService: {addArticle: vi.fn()},
}));

const EMPTY: PostState = {};

function formData(fields: Record<string, string>) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) fd.set(key, value);
    return fd;
}

describe("postAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should publish then redirect to the freshly created article", async () => {
        vi.mocked(articlesService.addArticle).mockResolvedValue({id: 99} as never);

        await postAction(EMPTY, formData({topicId: "3", title: "Un titre correct", content: "x".repeat(50)}));

        // topicId est transmis en nombre (issu d'un <select>).
        expect(articlesService.addArticle).toHaveBeenCalledWith("Un titre correct", "x".repeat(50), 3);
        expect(redirect).toHaveBeenCalledWith("/article/99?created=1");
    });

    it("should return the error state and keep the values on failure", async () => {
        vi.mocked(articlesService.addArticle).mockRejectedValue(new AppError(401, "Authentication required"));

        const state = await postAction(EMPTY, formData({topicId: "3", title: "Un titre correct", content: "x".repeat(50)}));

        expect(state).toEqual({
            error: "Authentication required",
            values: {topicId: 3, title: "Un titre correct", content: "x".repeat(50)},
        });
        expect(redirect).not.toHaveBeenCalled();
    });
});
