import {beforeEach, describe, expect, it, vi} from "vitest";
import bcrypt from "bcrypt";
import prisma from "../../__mocks__/prisma";
import {usersService} from "@/src/lib/users/users.service";
import {getCurrentUserId} from "@/src/lib/auth";

// Le service traverse le vrai repository ; seuls Prisma et la session sont mockés.
vi.mock("@/prisma", async () => await import("../../__mocks__/prisma"));
vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

const VALID_PASSWORD = "Azerty#123";
const USER = {
    id: 1,
    email: "victor@mdd.dev",
    username: "victor",
    password: bcrypt.hashSync(VALID_PASSWORD, 10),
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-02"),
};
// Un second compte, pour les conflits d'unicité (email / username déjà pris).
const OTHER = {...USER, id: 2, username: "juliette", email: "juliette@mdd.dev"};

describe("UsersService", () => {
    describe("register", () => {
        const INPUT = {username: "victor", email: "victor@mdd.dev", password: VALID_PASSWORD};

        it("should throw a ZodError when the input is invalid (no DB call)", async () => {
            await expect(usersService.register({...INPUT, password: "weak"})).rejects.toThrow();
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it("should throw 409 when the email already exists", async () => {
            prisma.user.findUnique.mockResolvedValueOnce(USER); // findByEmail → existant
            await expect(usersService.register(INPUT)).rejects.toMatchObject({
                statusCode: 409,
                message: "Cette adresse email existe déjà",
            });
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it("should throw 409 when the username already exists", async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(null) // findByEmail → libre
                .mockResolvedValueOnce(USER); // findByUsername → pris
            await expect(usersService.register(INPUT)).rejects.toMatchObject({
                statusCode: 409,
                message: "Ce nom d'utilisateur existe déjà",
            });
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it("should insert the user with a hashed password when email and username are free", async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue(USER);

            await usersService.register(INPUT);

            const createArg = prisma.user.create.mock.calls[0][0].data;
            expect(createArg.username).toBe(INPUT.username);
            expect(createArg.email).toBe(INPUT.email);
            // Le mot de passe n'est jamais stocké en clair.
            expect(createArg.password).not.toBe(VALID_PASSWORD);
            expect(bcrypt.compareSync(VALID_PASSWORD, createArg.password as string)).toBe(true);
        });
    });

    describe("getCurrentUser", () => {
        it("should read the connected user by id from the session", async () => {
            vi.mocked(getCurrentUserId).mockResolvedValue(USER.id);
            prisma.user.findUnique.mockResolvedValue(USER);

            const res = await usersService.getCurrentUser();

            expect(res).toBe(USER);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({where: {id: USER.id}});
        });
    });

    describe("updateProfile", () => {
        const INPUT = {username: "victor", email: "victor@mdd.dev", password: ""};

        beforeEach(() => {
            vi.mocked(getCurrentUserId).mockResolvedValue(USER.id);
        });

        it("should throw 409 when the email belongs to another user", async () => {
            prisma.user.findUnique.mockResolvedValueOnce(OTHER); // findByEmail → autre compte
            await expect(usersService.updateProfile(INPUT)).rejects.toMatchObject({
                statusCode: 409,
                message: "Cette adresse email existe déjà",
            });
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it("should throw 409 when the username belongs to another user", async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(USER) // findByEmail → soi-même, OK
                .mockResolvedValueOnce(OTHER); // findByUsername → autre compte
            await expect(usersService.updateProfile(INPUT)).rejects.toMatchObject({
                statusCode: 409,
                message: "Ce nom d'utilisateur existe déjà",
            });
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it("should update username and email without touching the password when it is empty", async () => {
            prisma.user.findUnique.mockResolvedValue(USER); // email et username appartiennent à soi
            prisma.user.update.mockResolvedValue(USER);

            await usersService.updateProfile(INPUT);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: {id: USER.id},
                data: {username: INPUT.username, email: INPUT.email},
            });
        });

        it("should hash and update the password when a new one is provided", async () => {
            prisma.user.findUnique.mockResolvedValue(USER);
            prisma.user.update.mockResolvedValue(USER);

            await usersService.updateProfile({...INPUT, password: "Newpass#1"});

            const data = prisma.user.update.mock.calls[0][0].data as {password?: string};
            expect(data.password).toBeDefined();
            expect(bcrypt.compareSync("Newpass#1", data.password as string)).toBe(true);
        });
    });
});
