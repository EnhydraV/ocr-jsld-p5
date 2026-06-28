import {loadEnvConfig} from "@next/env";
import {execSync} from "node:child_process";

/**
 * Prépare la base JETABLE pour les captures d'écran : applique les migrations puis
 * exécute le seed de démonstration complet (`prisma/seed.ts` — thèmes, utilisateurs,
 * abonnements, articles, commentaires). Contrairement au global-setup e2e (jeu
 * minimal calé sur les assertions), on veut ici des données riches pour que le fil
 * et le profil connectés soient représentatifs.
 *
 * N'utilise QUE `E2E_DATABASE_URL` (base jetable) et refuse de retomber sur
 * `DATABASE_URL` (dev), car le seed VIDE puis recrée les données. Le seed enfant
 * reçoit `DATABASE_URL` = base jetable ; son `loadEnvConfig` ne réécrit pas une
 * variable déjà posée (cf. playwright.config.ts), la base de dev est donc hors
 * d'atteinte.
 */
export default async function screenshotsGlobalSetup() {
    loadEnvConfig(process.cwd());

    const connectionString = process.env.E2E_DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            "E2E_DATABASE_URL est obligatoire pour les captures (cette étape VIDE et resème la base ciblée). " +
            "Renseigne une base jetable distincte de la dev — voir .env.e2e.example.",
        );
    }
    if (connectionString === process.env.DATABASE_URL) {
        throw new Error(
            "E2E_DATABASE_URL pointe la même base que DATABASE_URL (dev) : refus pour ne pas l'écraser.",
        );
    }

    const env = {...process.env, DATABASE_URL: connectionString};
    execSync("npx prisma migrate deploy", {env, stdio: "inherit"});
    execSync("npx prisma db seed", {env, stdio: "inherit"});
}
