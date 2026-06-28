import {defineConfig, devices} from "@playwright/test";
import {loadEnvConfig} from "@next/env";
import dotenv from "dotenv";

// Charge le .env comme Next.js (interpolation des ${...}) pour disposer de
// DATABASE_URL côté global-setup. E2E_DATABASE_URL permet de viser une base
// jetable distincte de celle de dev (le global-setup la VIDE avant de semer).
loadEnvConfig(process.cwd());
// @next/env ne connaît que les fichiers standards (.env, .env.local, ...) : il
// ignore .env.e2e. On le charge donc explicitement pour récupérer E2E_DATABASE_URL.
// dotenv n'écrase pas les variables déjà présentes (un export manuel reste prioritaire).
dotenv.config({path: ".env.e2e"});

// Sécurité : on EXIGE E2E_DATABASE_URL (base jetable). Le global-setup VIDE la
// base ciblée — pas question de retomber silencieusement sur DATABASE_URL et
// d'écraser la base de dev. On refuse aussi qu'elle pointe la même base que dev.
const DATABASE_URL = process.env.E2E_DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error(
        "E2E_DATABASE_URL est obligatoire pour les tests e2e (le global-setup VIDE la base ciblée). " +
        "Renseigne une base jetable distincte de la dev — voir .env.e2e.example.",
    );
}
if (DATABASE_URL === process.env.DATABASE_URL) {
    throw new Error(
        "E2E_DATABASE_URL pointe la même base que DATABASE_URL (dev) : refus, utilise une base jetable séparée.",
    );
}

/**
 * Configuration Playwright (tests end-to-end). L'app est lancée par `webServer`,
 * la base est préparée par `global-setup`, et l'authentification est mutualisée
 * via un projet `setup` qui enregistre l'état de session (storageState).
 *
 * Prérequis d'exécution : un PostgreSQL joignable (DATABASE_URL ou
 * E2E_DATABASE_URL) et Docker pour le faire tourner en local. Voir NOTES.md.
 */
export default defineConfig({
    testDir: "./e2e",
    // Base partagée + données mutées par certains scénarios : on sérialise.
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [["list"], ["html", {open: "never"}]],
    timeout: 30_000,
    globalSetup: "./e2e/global-setup.ts",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        // Se connecte une fois et enregistre la session pour les scénarios authentifiés.
        {name: "setup", testMatch: /auth\.setup\.ts/},
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json"},
            dependencies: ["setup"],
            // Les audits Lighthouse ont leur propre config (playwright.lighthouse.config.ts).
            testIgnore: [/auth\.setup\.ts/, /lighthouse\.spec\.ts/],
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // @next/env ne réécrit pas une variable déjà posée : l'app utilisera bien
        // cette DATABASE_URL (base e2e) plutôt que celle du .env.
        env: {...process.env, DATABASE_URL},
    },
});
