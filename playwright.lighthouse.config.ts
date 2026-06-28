import {defineConfig} from "@playwright/test";
import baseConfig from "./playwright.config";

/**
 * Configuration Playwright dédiée aux audits Lighthouse (`npm run test:lighthouse`).
 *
 * Réutilise tout le socle des e2e (global-setup, base semée) défini dans
 * `playwright.config.ts`, mais ne lance que deux projets : `setup` (connexion
 * + storageState) puis `lighthouse` (les audits eux-mêmes). Séparée du run e2e
 * habituel car nettement plus lourde, sur le même modèle que la config Vitest
 * d'intégration distincte.
 *
 * Différence clé avec le socle : le `webServer` lance un VRAI build de prod
 * (`next build && next start`) au lieu du serveur de dev, sinon les scores de
 * performance n'auraient aucun sens (dev = non minifié, HMR, source maps).
 */

// webServer du socle (objet unique) : on en réutilise l'`env` (qui injecte la base
// e2e via DATABASE_URL) et l'`url`, en ne surchargeant que la commande et les délais.
const baseWebServer = baseConfig.webServer as Extract<
    typeof baseConfig.webServer,
    {command: string}
>;

export default defineConfig({
    ...baseConfig,
    // Audits séquentiels : Lighthouse sature déjà le CPU, le parallélisme fausserait les scores.
    workers: 1,
    fullyParallel: false,
    webServer: {
        ...baseWebServer,
        // Build de prod audité (et non `npm run dev`) : seul moyen d'obtenir des
        // scores de performance représentatifs.
        command: "npm run build && npm run start",
        // On NE réutilise PAS un serveur déjà ouvert sur le port : ce pourrait être
        // un `next dev`, ce qui fausserait totalement la performance mesurée.
        reuseExistingServer: false,
        // `next build` peut être long : délai de démarrage élargi en conséquence.
        timeout: 300_000,
    },
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
