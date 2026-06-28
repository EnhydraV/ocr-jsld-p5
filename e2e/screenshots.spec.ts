import fs from "node:fs";
import path from "node:path";
import {test, devices, type BrowserContext} from "@playwright/test";

/**
 * Captures d'écran automatisées des vues principales, pour les annexes de la
 * documentation. Chaque page est prise en desktop ET en mobile, en pleine hauteur
 * (`fullPage`). Les pages publiques sont rendues dans un contexte anonyme (le
 * middleware redirige un utilisateur connecté hors de `/`, `/login`, `/register`)
 * et les pages privées dans un contexte authentifié (storageState du seed).
 *
 * Les images sont écrites dans `screenshots/<facteur>/<vue>.png` (ignoré par git).
 */

const STORAGE_STATE = "e2e/.auth/screenshots.json";
const OUT_DIR = "screenshots";

const FORM_FACTORS = [
    {name: "desktop", device: devices["Desktop Chrome"]},
    {name: "mobile", device: devices["Pixel 5"]},
];

const PUBLIC_PAGES = [
    {name: "accueil", path: "/"},
    {name: "connexion", path: "/login"},
    {name: "inscription", path: "/register"},
];

const PRIVATE_PAGES = [
    {name: "fil", path: "/feed"},
    {name: "themes", path: "/topics"},
    {name: "redaction-article", path: "/article/new"},
    {name: "profil", path: "/profile"},
];

/** Ouvre la page, attend le réseau au repos, capture en pleine hauteur, ferme. */
async function shoot(context: BrowserContext, baseURL: string, dir: string, name: string, urlPath: string) {
    const page = await context.newPage();
    await page.goto(`${baseURL}${urlPath}`, {waitUntil: "networkidle"});
    await page.screenshot({path: path.join(dir, `${name}.png`), fullPage: true});
    await page.close();
}

test("captures des vues principales (desktop + mobile)", async ({browser, baseURL}) => {
    test.slow();
    const base = baseURL ?? "http://localhost:3000";

    for (const factor of FORM_FACTORS) {
        const dir = path.join(OUT_DIR, factor.name);
        fs.mkdirSync(dir, {recursive: true});

        // Pages publiques : contexte anonyme.
        const anon = await browser.newContext({...factor.device});
        for (const target of PUBLIC_PAGES) {
            await shoot(anon, base, dir, target.name, target.path);
        }
        await anon.close();

        // Pages privées : contexte authentifié (session du seed).
        const authed = await browser.newContext({...factor.device, storageState: STORAGE_STATE});
        for (const target of PRIVATE_PAGES) {
            await shoot(authed, base, dir, target.name, target.path);
        }

        // Détail d'un article : on suit le premier lien d'article du fil.
        const page = await authed.newPage();
        await page.goto(`${base}/feed`, {waitUntil: "networkidle"});
        const firstArticle = page.locator('a[href^="/article/"]').first();
        if (await firstArticle.count()) {
            await firstArticle.click();
            await page.waitForURL("**/article/**");
            await page.waitForLoadState("networkidle");
            await page.screenshot({path: path.join(dir, "article-detail.png"), fullPage: true});
        }
        await page.close();
        await authed.close();
    }
});
