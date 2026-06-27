import {PostgreSqlContainer} from "@testcontainers/postgresql";
import {execSync} from "node:child_process";

// Démarre un PostgreSQL temporaire (même image que docker-compose.yml) et applique
// les vraies migrations Prisma. Exécuté une seule fois avant tous les tests
// d'intégration. Nécessite Docker. Repris du style du projet p04.
//
// `DATABASE_URL` est posée AVANT le chargement de la config Prisma : `@next/env`
// (via prisma.config.ts) ne réécrit pas une variable déjà présente dans
// l'environnement, donc la CLI cible bien le conteneur et non le `.env` local.
export default async function globalSetup() {
    const container = await new PostgreSqlContainer("postgres:16-alpine").start();

    process.env.DATABASE_URL = container.getConnectionUri();

    execSync("npx prisma migrate deploy", {
        env: process.env,
        stdio: "inherit",
    });

    return async () => {
        await container.stop();
    };
}
