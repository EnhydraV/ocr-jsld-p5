import {PrismaClient} from "@prisma/client";
import {beforeEach} from "vitest";
import {mockDeep, mockReset} from "vitest-mock-extended";

// Mock profond du client Prisma : chaque méthode (`user.findUnique`, etc.) est
// une fonction vitest qu'on stub par test. Réinitialisé avant chaque test pour
// éviter toute fuite d'état entre cas. Repris du style du projet p04.
beforeEach(() => {
    mockReset(prisma);
});

const prisma = mockDeep<PrismaClient>();

// `@/prisma` exporte un nommé `prisma` : on reproduit la même forme pour que
// `vi.mock("@/prisma", () => import("…/__mocks__/prisma"))` soit transparent.
export {prisma};
export default prisma;
