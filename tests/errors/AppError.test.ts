import {describe, expect, it} from "vitest";
import {AppError} from "@/src/errors/AppError";

describe("AppError", () => {
    it("should carry the status code and the message", () => {
        const error = new AppError(404, "Not found");
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Not found");
    });

    it("should be an Error with the AppError name", () => {
        const error = new AppError(401, "Authentication required");
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("AppError");
    });
});
