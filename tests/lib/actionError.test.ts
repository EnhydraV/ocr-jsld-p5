import {afterEach, describe, expect, it, vi} from "vitest";
import {z} from "zod";
import {toActionError} from "@/src/lib/actionError";
import {AppError} from "@/src/errors/AppError";

const VALUES = {username: "neo", email: "neo@matrix.io"};

describe("toActionError", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return the first Zod issue message and keep the values", () => {
        // On déclenche une vraie ZodError pour rester fidèle au flux réel.
        const schema = z.object({email: z.string().email("Email invalide")});
        let zodError: unknown;
        try {
            schema.parse({email: "pasunemail"});
        } catch (error) {
            zodError = error;
        }

        const state = toActionError(zodError, VALUES, "test");
        expect(state).toEqual({error: "Email invalide", values: VALUES});
    });

    it("should surface the AppError business message", () => {
        const state = toActionError(new AppError(409, "Déjà pris"), VALUES, "test");
        expect(state).toEqual({error: "Déjà pris", values: VALUES});
    });

    it("should log and return a generic message for an unexpected error", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        const state = toActionError(new Error("boom"), VALUES, "registerAction");

        expect(state.error).toBe("Une erreur interne est survenue. Réessaie plus tard.");
        expect(state.values).toEqual(VALUES);
        // L'erreur inattendue est tracée côté serveur, avec son étiquette de contexte.
        expect(spy).toHaveBeenCalledWith("registerAction:", expect.any(Error));
    });
});
