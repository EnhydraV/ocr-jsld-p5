import {test as base, chromium} from "@playwright/test";
import net from "node:net";
import type {AddressInfo} from "node:net";

/**
 * Trouve un port TCP libre en demandant le port 0 au système, puis en relâchant
 * aussitôt le serveur éphémère. Évite une dépendance ESM-only (`get-port`) et le
 * risque de collision d'un port fixe entre plusieurs exécutions.
 */
function findFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on("error", reject);
        server.listen(0, () => {
            const {port} = server.address() as AddressInfo;
            server.close(() => resolve(port));
        });
    });
}

/**
 * Test Playwright étendu pour les audits Lighthouse.
 *
 * Lighthouse pilote Chrome via le protocole CDP : il lui faut un Chrome lancé
 * avec un port de debug ouvert. On expose donc une fixture `port` (scope worker)
 * qui démarre un Chromium dédié avec `--remote-debugging-port`, garde l'instance
 * vivante le temps des audits, puis la referme. `--no-sandbox` est requis dans le
 * conteneur (aucun sandbox possible) et inoffensif ailleurs.
 *
 * On ne réutilise volontairement PAS la page Playwright authentifiée : Lighthouse
 * navigue dans le contexte par défaut du navigateur, distinct du contexte
 * Playwright qui porte le `storageState`. L'authentification passe donc par un
 * en-tête Cookie explicite (voir lighthouse.spec.ts), pas par ce navigateur.
 */
export const test = base.extend<object, {port: number}>({
    port: [
        async ({}, use) => {
            const port = await findFreePort();
            const browser = await chromium.launch({
                args: [`--remote-debugging-port=${port}`, "--no-sandbox"],
            });
            await use(port);
            await browser.close();
        },
        {scope: "worker"},
    ],
});

export {expect} from "@playwright/test";
