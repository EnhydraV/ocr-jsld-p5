import {defineConfig} from "@playwright/test";
import baseConfig from "./playwright.config";

/**
 * Configuration Playwright dédiée aux captures d'écran (`npm run screenshots`).
 *
 * Réutilise le socle e2e (webServer, base jetable via E2E_DATABASE_URL) mais avec
 * son PROPRE global-setup, qui sème le jeu de données COMPLET (`prisma/seed.ts`,
 * abonnements inclus) au lieu du jeu minimal des e2e : les vues connectées sont
 * ainsi représentatives. Comme Lighthouse, on audite un vrai build de prod pour
 * éviter l'overlay de dev et obtenir un rendu fidèle.
 */

const baseWebServer = baseConfig.webServer as Extract<
    typeof baseConfig.webServer,
    {command: string}
>;

export default defineConfig({
    ...baseConfig,
    workers: 1,
    fullyParallel: false,
    // 16 captures pleine hauteur : on élargit le délai par test.
    timeout: 120_000,
    // Seed riche (et non le jeu minimal e2e) sur la base jetable.
    globalSetup: "./e2e/screenshots.global-setup.ts",
    webServer: {
        ...baseWebServer,
        // Build de prod : rendu fidèle, sans l'overlay de `next dev`.
        command: "npm run build && npm run start",
        reuseExistingServer: false,
        timeout: 300_000,
    },
    projects: [
        {name: "setup", testMatch: /screenshots\.setup\.ts/},
        {
            name: "screenshots",
            testMatch: /screenshots\.spec\.ts/,
            dependencies: ["setup"],
        },
    ],
});
