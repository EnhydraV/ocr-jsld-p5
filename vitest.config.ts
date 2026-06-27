import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";

// Configuration des tests unitaires. La base réelle (Docker) a sa propre config :
// vitest.integration.config.ts.
export default defineConfig({
    resolve: {
        // Reproduit l'alias `@/*` du tsconfig pour que les imports de la source
        // (`@/prisma`, `@/src/lib/...`) se résolvent dans les tests.
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
    test: {
        include: ["tests/**/*.test.ts"],
        exclude: ["tests/integration/**", "**/node_modules/**"],
        globals: true,
        environment: "node",
        isolate: true,
    },
});
