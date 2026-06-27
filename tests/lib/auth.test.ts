import {beforeEach, describe, expect, it, vi} from "vitest";
import bcrypt from "bcrypt";
import {getServerSession} from "next-auth";
import {authOptions, getCurrentUserId} from "@/src/lib/auth";
import {usersService} from "@/src/lib/users/users.service";

// `getServerSession` (next-auth) et le service utilisateurs sont mockés : on teste
// la logique d'authentification isolément, avec un vrai bcrypt.
vi.mock("next-auth", () => ({getServerSession: vi.fn()}));
vi.mock("@/src/lib/users/users.service", () => ({
    usersService: {findByEmailOrUsername: vi.fn()},
}));

// next-auth v4 conserve la fonction `authorize` d'origine sous `.options` (la clé
// de premier niveau est, elle, remplacée par un défaut interne).
const authorize = (authOptions.providers[0] as unknown as {
    options: {authorize: (credentials: Record<string, string> | undefined) => Promise<unknown>};
}).options.authorize;

const PASSWORD = "Azerty#123";
const USER = {
    id: 42,
    email: "victor@mdd.dev",
    username: "victor",
    password: bcrypt.hashSync(PASSWORD, 10),
};

describe("authorize (Credentials provider)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw 401 when no credentials are provided", async () => {
        await expect(authorize(undefined)).rejects.toMatchObject({
            statusCode: 401,
            message: "Authentication required",
        });
        expect(usersService.findByEmailOrUsername).not.toHaveBeenCalled();
    });

    it("should throw 401 when the user is unknown", async () => {
        vi.mocked(usersService.findByEmailOrUsername).mockResolvedValue(null);
        await expect(authorize({email: "ghost@mdd.dev", password: PASSWORD})).rejects.toMatchObject({
            statusCode: 401,
            message: "Wrong username/email or password",
        });
    });

    it("should throw 401 when the password does not match", async () => {
        vi.mocked(usersService.findByEmailOrUsername).mockResolvedValue(USER as never);
        await expect(authorize({email: USER.email, password: "Wrong#123"})).rejects.toMatchObject({
            statusCode: 401,
            message: "Wrong username/email or password",
        });
    });

    it("should return the session identity (id as string) on valid credentials", async () => {
        vi.mocked(usersService.findByEmailOrUsername).mockResolvedValue(USER as never);
        const res = await authorize({email: USER.email, password: PASSWORD});
        expect(res).toEqual({id: "42", email: USER.email, name: USER.username});
    });
});

describe("authOptions callbacks", () => {
    const callbacks = authOptions.callbacks!;

    it("jwt should copy the user id into the token on sign-in", async () => {
        const token = await callbacks.jwt!({token: {}, user: {id: "42"}} as never);
        expect(token).toMatchObject({id: "42"});
    });

    it("jwt should leave the token untouched without a user", async () => {
        const token = await callbacks.jwt!({token: {id: "7"}} as never);
        expect(token).toEqual({id: "7"});
    });

    it("session should expose the token id on the session user", async () => {
        const session = await callbacks.session!({
            session: {user: {}},
            token: {id: "42"},
        } as never);
        expect((session.user as {id: string}).id).toBe("42");
    });
});

describe("getCurrentUserId", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the numeric id of the connected user", async () => {
        vi.mocked(getServerSession).mockResolvedValue({user: {id: "42"}} as never);
        expect(await getCurrentUserId()).toBe(42);
    });

    it("should throw 401 when there is no valid session", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null as never);
        await expect(getCurrentUserId()).rejects.toMatchObject({
            statusCode: 401,
            message: "Authentication required",
        });
    });
});
