import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

// Charge le .env comme Next.js (interpolation des ${...} incluse), pour que la
// CLI Prisma et le runtime partagent la même source de vérité — une seule
// définition des variables de connexion dans le .env.
loadEnvConfig(process.cwd());

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});