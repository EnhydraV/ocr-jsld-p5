import {describe, expect, it} from "vitest";
import {ArticleSchema} from "@/src/lib/articles/articles.dto";

const VALID_ARTICLE = {
    title: "Un titre correct",
    content: "x".repeat(50),
    topicId: 1,
};

describe("ArticleSchema", () => {
    it("should accept a valid article and trim the text fields", () => {
        const parsed = ArticleSchema.parse({...VALID_ARTICLE, title: "  Un titre correct  "});
        expect(parsed.title).toBe("Un titre correct");
    });

    it.each([
        ["title too short (<5)", {title: "abc"}],
        ["title too long (>256)", {title: "a".repeat(257)}],
        ["content too short (<50)", {content: "trop court"}],
        ["topicId below 1", {topicId: 0}],
    ])("should reject %s", (_label, override) => {
        expect(() => ArticleSchema.parse({...VALID_ARTICLE, ...override})).toThrow();
    });
});
