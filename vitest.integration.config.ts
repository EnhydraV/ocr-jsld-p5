import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";

// Tests d'intégration : vraie base PostgreSQL éphémère (Testcontainers, voir
// tests/integration/global-setup.ts). Nécessite Docker.
export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
    test: {
        include: ["tests/integration/**/*.test.ts"],
        globals: true,
        environment: "node",
        globalSetup: ["tests/integration/global-setup.ts"],
        // Une seule base partagée, remise à zéro entre les tests : on évite le
        // parallélisme inter-fichiers qui se marcherait dessus.
        fileParallelism: false,
        testTimeout: 30_000,
        hookTimeout: 120_000,
    },
});
