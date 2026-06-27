import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {prisma} from "@/prisma";
import {usersService} from "@/src/lib/users/users.service";
import {getCurrentUserId} from "@/src/lib/auth";
import {resetDb, seedUser} from "./db-utils";

// Vraie base, vrais repositories ; seule la session (frontière externe) est stubée.
vi.mock("@/src/lib/auth", () => ({getCurrentUserId: vi.fn()}));

beforeEach(resetDb);
afterAll(async () => {
    await prisma.$disconnect();
});

const VALID_INPUT = {username: "victor", email: "victor@mdd.dev", password: "Azerty#123"};

describe("UsersService (integration)", () => {
    describe("register", () => {
        it("should persist a new user with a hashed password", async () => {
            await usersService.register(VALID_INPUT);

            const stored = await prisma.user.findUniqueOrThrow({where: {email: VALID_INPUT.email}});
            expect(stored.username).toBe("victor");
            expect(stored.password).not.toBe(VALID_INPUT.password); // haché en base
        });

        it("should throw 409 when the email already exists", async () => {
            await prisma.user.create({data: {email: VALID_INPUT.email, username: "juliette", password: "h"}});
            await expect(usersService.register(VALID_INPUT)).rejects.toMatchObject({statusCode: 409});
        });
    });

    describe("updateProfile", () => {
        it("should update username and email of the connected user", async () => {
            const user = await seedUser();
            vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

            await usersService.updateProfile({username: "victor-renamed", email: "renamed@mdd.dev", password: ""});

            const stored = await prisma.user.findUniqueOrThrow({where: {id: user.id}});
            expect(stored.username).toBe("victor-renamed");
            expect(stored.email).toBe("renamed@mdd.dev");
        });

        it("should throw 409 when the target email belongs to another user", async () => {
            const user = await seedUser("victor");
            const other = await seedUser("juliette");
            vi.mocked(getCurrentUserId).mockResolvedValue(user.id);

            await expect(
                usersService.updateProfile({username: "victor", email: other.email, password: ""}),
            ).rejects.toMatchObject({statusCode: 409});
        });
    });
});
