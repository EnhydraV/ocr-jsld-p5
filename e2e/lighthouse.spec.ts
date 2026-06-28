import fs from "node:fs";
import path from "node:path";
import {playAudit} from "playwright-lighthouse";
import {test} from "./lighthouse.fixtures";

/**
 * Audits d'accessibilité automatisés (Lighthouse).
 *
 * Chaque page ciblée est auditée par Lighthouse, qui se connecte au Chrome de
 * debug ouvert par la fixture `port`. Le score d'accessibilité est BLOQUANT
 * (seuil ci-dessous) : un test échoue si la page repasse sous le seuil, comme un
 * test classique. `best-practices` et `seo` sont mesurés et présents dans les
 * rapports, mais non bloquants (absents des `thresholds`). La performance est
 * volontairement exclue : trop dépendante de la machine pour servir de garde-fou.
 *
 * Les rapports HTML/JSON sont écrits dans `lighthouse-report/` (ignoré par git).
 */

// Seuil d'accessibilité bloquant. Relevé progressivement au fil des corrections.
const ACCESSIBILITY_THRESHOLD = 90;

const BASE_URL = "http://localhost:3000";
const REPORTS_DIR = "lighthouse-report";
const STORAGE_STATE = path.join("e2e", ".auth", "user.json");

// Type du paramètre de playAudit : on en dérive les types d'`opts`/`config` pour
// éviter d'importer directement les types ESM de `lighthouse`.
type AuditConfig = Parameters<typeof playAudit>[0];

/**
 * Reconstruit un en-tête `Cookie` à partir du `storageState` produit par
 * `auth.setup.ts`. Lighthouse navigue hors du contexte Playwright authentifié :
 * on lui réinjecte la session via cet en-tête, sans quoi le middleware
 * redirigerait vers `/login`.
 */
function authCookieHeader(): string {
    const raw = fs.readFileSync(STORAGE_STATE, "utf-8");
    const {cookies} = JSON.parse(raw) as {cookies: {name: string; value: string}[]};
    return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

/**
 * Configuration Lighthouse « desktop » : on aligne le facteur de forme et
 * l'émulation d'écran sur le `Desktop Chrome` utilisé par le reste des e2e,
 * plutôt que sur le mobile (défaut de Lighthouse).
 */
const desktopConfig: NonNullable<AuditConfig["config"]> = {
    extends: "lighthouse:default",
    settings: {
        formFactor: "desktop",
        screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
        },
    },
};

/** Pages auditées. `auth` indique si la session connectée est nécessaire. */
const TARGETS: {name: string; path: string; auth: boolean}[] = [
    {name: "home", path: "/", auth: false},
    {name: "login", path: "/login", auth: false},
    {name: "register", path: "/register", auth: false},
    {name: "feed", path: "/feed", auth: true},
    {name: "topics", path: "/topics", auth: true},
    {name: "article-new", path: "/article/new", auth: true},
    {name: "profile", path: "/profile", auth: true},
];

for (const target of TARGETS) {
    test(`accessibilité — ${target.path}`, async ({port}) => {
        const opts: NonNullable<AuditConfig["opts"]> = {
            onlyCategories: ["accessibility", "best-practices", "seo"],
        };
        // Pages privées : on réinjecte la session via l'en-tête Cookie.
        if (target.auth) {
            opts.extraHeaders = {Cookie: authCookieHeader()};
        }

        await playAudit({
            url: `${BASE_URL}${target.path}`,
            port,
            thresholds: {accessibility: ACCESSIBILITY_THRESHOLD},
            opts,
            config: desktopConfig,
            reports: {
                formats: {html: true, json: true},
                directory: REPORTS_DIR,
                name: target.name,
            },
            ignoreBrowserName: true,
            disableLogs: true,
        });
    });
}
