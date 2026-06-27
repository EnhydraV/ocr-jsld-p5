import {describe, expect, it} from "vitest";
import {CommentSchema} from "@/src/lib/comments/comments.dto";

const VALID_COMMENT = {content: "Bien vu !", articleId: 1};

describe("CommentSchema", () => {
    it("should accept a valid comment and trim the content", () => {
        const parsed = CommentSchema.parse({...VALID_COMMENT, content: "  Bien vu !  "});
        expect(parsed.content).toBe("Bien vu !");
    });

    it.each([
        ["empty content", {content: "   "}],
        ["articleId below 1", {articleId: 0}],
    ])("should reject %s", (_label, override) => {
        expect(() => CommentSchema.parse({...VALID_COMMENT, ...override})).toThrow();
    });
});
