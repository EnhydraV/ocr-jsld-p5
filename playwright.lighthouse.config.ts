import {defineConfig} from "@playwright/test";
import baseConfig from "./playwright.config";

/**
 * Configuration Playwright dédiée aux audits Lighthouse (`npm run test:lighthouse`).
 *
 * Réutilise tout le socle des e2e (webServer, global-setup, base semée) défini
 * dans `playwright.config.ts`, mais ne lance que deux projets : `setup` (connexion
 * + storageState) puis `lighthouse` (les audits eux-mêmes). Séparée du run e2e
 * habituel car nettement plus lourde, sur le même modèle que la config Vitest
 * d'intégration distincte.
 */
export default defineConfig({
    ...baseConfig,
    // Audits séquentiels : Lighthouse sature déjà le CPU, le parallélisme fausserait les scores.
    workers: 1,
    fullyParallel: false,
    projects: [
        {name: "setup", testMatch: /auth\.setup\.ts/},
        {
            name: "lighthouse",
            testMatch: /lighthouse\.spec\.ts/,
            // La session est réinjectée via en-tête Cookie dans le spec : pas de storageState ici.
            dependencies: ["setup"],
        },
    ],
});
