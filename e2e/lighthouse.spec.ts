import fs from "node:fs";
import path from "node:path";
import {playAudit} from "playwright-lighthouse";
import {test} from "./lighthouse.fixtures";

/**
 * Audits Lighthouse automatisés (desktop ET mobile : chaque page est auditée
 * dans les deux facteurs de forme).
 *
 * Chaque page ciblée est auditée par Lighthouse, qui se connecte au Chrome de
 * debug ouvert par la fixture `port`. Le score d'accessibilité est BLOQUANT
 * (seuil ci-dessous) : un test échoue si la page repasse sous le seuil, comme un
 * test classique. `performance`, `best-practices` et `seo` sont mesurés et
 * présents dans les rapports, mais NON bloquants (absents des `thresholds`) : la
 * performance en particulier dépend trop de la machine pour servir de garde-fou.
 * Les quatre scores sont récapitulés dans un tableau en fin de run (`afterAll`).
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
 * Configuration Lighthouse « desktop » : facteur de forme et émulation d'écran
 * alignés sur le `Desktop Chrome` du reste des e2e, plus le throttling « desktop »
 * officiel (réseau rapide, pas de bridage CPU) — sans quoi le score de performance
 * desktop serait calculé avec le bridage mobile par défaut, donc faussé.
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
        throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
        },
    },
};

/**
 * Configuration Lighthouse « mobile » : facteur de forme mobile et écran émulé
 * type smartphone. Le throttling (réseau lent + CPU ×4) est laissé au défaut de
 * `lighthouse:default`, qui est précisément le profil mobile de référence.
 */
const mobileConfig: NonNullable<AuditConfig["config"]> = {
    extends: "lighthouse:default",
    settings: {
        formFactor: "mobile",
        screenEmulation: {
            mobile: true,
            width: 412,
            height: 823,
            deviceScaleFactor: 1.75,
            disabled: false,
        },
    },
};

/** Facteurs de forme audités : chaque page est mesurée en desktop ET en mobile. */
const FORM_FACTORS: {name: string; config: NonNullable<AuditConfig["config"]>}[] = [
    {name: "desktop", config: desktopConfig},
    {name: "mobile", config: mobileConfig},
];

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

/** Scores collectés au fil des audits, pour le récapitulatif final. */
type CategoryScores = {performance: number; accessibility: number; bestPractices: number; seo: number};
const summary: Record<string, CategoryScores> = {};

/** Score Lighthouse (0–1, parfois `null`) ramené sur 100. */
function toScore(score: number | null | undefined): number {
    return Math.round((score ?? 0) * 100);
}

for (const factor of FORM_FACTORS) {
    for (const target of TARGETS) {
        test(`audit Lighthouse — ${factor.name} — ${target.path}`, async ({port}) => {
            const opts: NonNullable<AuditConfig["opts"]> = {
                onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
            };
            // Pages privées : on réinjecte la session via l'en-tête Cookie.
            if (target.auth) {
                opts.extraHeaders = {Cookie: authCookieHeader()};
            }

            const {lhr} = await playAudit({
                url: `${BASE_URL}${target.path}`,
                port,
                thresholds: {accessibility: ACCESSIBILITY_THRESHOLD},
                opts,
                config: factor.config,
                reports: {
                    formats: {html: true, json: true},
                    directory: REPORTS_DIR,
                    // Suffixe le form factor pour ne pas écraser le rapport de l'autre.
                    name: `${target.name}-${factor.name}`,
                },
                ignoreBrowserName: true,
                disableLogs: true,
            });

            // On mémorise les 4 scores (perf/seo/bonnes pratiques non bloquants) pour le récap.
            const {categories} = lhr;
            summary[`${target.path} [${factor.name}]`] = {
                performance: toScore(categories.performance?.score),
                accessibility: toScore(categories.accessibility?.score),
                bestPractices: toScore(categories["best-practices"]?.score),
                seo: toScore(categories.seo?.score),
            };
        });
    }
}

// Récapitulatif lisible des scores en fin de run. Seul `accessibility` est
// bloquant (cf. seuil) ; les autres colonnes sont purement informatives.
test.afterAll(() => {
    if (Object.keys(summary).length === 0) return;
    console.log("\nScores Lighthouse (desktop + mobile) — accessibilité bloquante, le reste informatif :");
    console.table(summary);
});
