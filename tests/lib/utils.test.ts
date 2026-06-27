import {describe, expect, it} from "vitest";
import {cn} from "@/src/lib/utils";

describe("cn", () => {
    it("should join the truthy class names", () => {
        expect(cn("a", "b")).toBe("a b");
    });

    it("should ignore the falsy values (conditional classes)", () => {
        expect(cn("a", false, undefined, null, "b")).toBe("a b");
    });

    it("should let tailwind-merge resolve conflicting utilities (last wins)", () => {
        expect(cn("px-2", "px-4")).toBe("px-4");
    });
});
