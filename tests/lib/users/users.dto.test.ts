import {describe, expect, it} from "vitest";
import {LoginSchema, RegisterSchema, UpdateProfileSchema} from "@/src/lib/users/users.dto";

// Mot de passe valide selon le brief : 8–20 caractères, 1 minuscule, 1 majuscule,
// 1 chiffre, 1 caractère spécial.
const VALID_PASSWORD = "Azerty#123";
const VALID_REGISTER = {username: "charlie", email: "charlie@mdd.dev", password: VALID_PASSWORD};

describe("RegisterSchema", () => {
    it("should accept a valid registration", () => {
        expect(RegisterSchema.parse(VALID_REGISTER)).toEqual(VALID_REGISTER);
    });

    it("should trim the username and the email", () => {
        const parsed = RegisterSchema.parse({...VALID_REGISTER, username: "  charlie  ", email: "  charlie@mdd.dev  "});
        expect(parsed.username).toBe("charlie");
        expect(parsed.email).toBe("charlie@mdd.dev");
    });

    it.each([
        ["too short username", {username: "ab"}],
        ["too long username", {username: "a".repeat(21)}],
        ["invalid email", {email: "pasunemail"}],
    ])("should reject %s", (_label, override) => {
        expect(() => RegisterSchema.parse({...VALID_REGISTER, ...override})).toThrow();
    });

    // Chaque règle de complexité du mot de passe est vérifiée isolément.
    it.each([
        ["too short", "Aa#1"],
        ["too long", "Azerty#123456789012345"],
        ["no lowercase", "AZERTY#123"],
        ["no uppercase", "azerty#123"],
        ["no digit", "Azerty#abc"],
        ["no special char", "Azerty1234"],
    ])("should reject a password that is %s", (_label, password) => {
        expect(() => RegisterSchema.parse({...VALID_REGISTER, password})).toThrow();
    });
});

describe("UpdateProfileSchema", () => {
    it("should accept an empty password as « do not change »", () => {
        const parsed = UpdateProfileSchema.parse({username: "charlie", email: "charlie@mdd.dev", password: ""});
        expect(parsed.password).toBe("");
    });

    it("should accept a missing password (optional)", () => {
        const parsed = UpdateProfileSchema.parse({username: "charlie", email: "charlie@mdd.dev"});
        expect(parsed.password).toBeUndefined();
    });

    it("should still enforce the policy on a non-empty password", () => {
        expect(() =>
            UpdateProfileSchema.parse({username: "charlie", email: "charlie@mdd.dev", password: "weak"}),
        ).toThrow();
    });
});

describe("LoginSchema", () => {
    it("should accept an identifier and a password, trimming the identifier", () => {
        const parsed = LoginSchema.parse({usernameoremail: "  charlie@mdd.dev  ", password: "whatever"});
        expect(parsed.usernameoremail).toBe("charlie@mdd.dev");
        expect(parsed.password).toBe("whatever");
    });
});
