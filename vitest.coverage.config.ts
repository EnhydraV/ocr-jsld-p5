import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";

// Mesure de couverture sur la couche logique côté serveur (services, repositories,
// DTO, actions, erreurs). Les composants React et les pages (`src/app/**`) en sont
// exclus : ils relèvent des tests e2e, traités séparément.
//
// Les tests unitaires mockent `@/prisma` mais traversent les *vrais* repositories
// (injection par défaut dans les services) : ceux-ci sont donc couverts sans
// Docker. Les tests d'intégration (vraie base) restent un filet de sécurité
// complémentaire, non requis pour atteindre le seuil.
export default defineConfig({
    resolve: {
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
        coverage: {
            provider: "v8",
            include: ["src/lib/**/*.ts", "src/errors/**/*.ts"],
            exclude: ["src/**/*.d.ts"],
            reporter: ["text", "json-summary", "html"],
            thresholds: {
                statements: 75,
                branches: 75,
                functions: 75,
                lines: 75,
            },
        },
    },
});
