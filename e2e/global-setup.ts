import {loadEnvConfig} from "@next/env";
import {execSync} from "node:child_process";
import {PrismaClient} from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import {ARTICLES, AUTHOR_USER, E2E_USER, TOPICS} from "./fixtures";

/**
 * Prépare la base avant toute la suite e2e : applique les migrations, vide les
 * tables puis sème un jeu de données déterministe (un utilisateur connu, des
 * thèmes, deux articles datés et un commentaire). Exécuté une fois par run.
 *
 * Vise `E2E_DATABASE_URL` si défini, sinon `DATABASE_URL`. ATTENTION : la base
 * ciblée est VIDÉE — pointer une base jetable, pas la base de dev.
 */
export default async function globalSetup() {
    loadEnvConfig(process.cwd());
    // Ce setup VIDE la base : on exige E2E_DATABASE_URL et on refuse tout repli
    // sur DATABASE_URL (dev), pour ne jamais écraser la base de développement.
    const connectionString = process.env.E2E_DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            "E2E_DATABASE_URL est obligatoire pour les tests e2e (cette étape VIDE la base ciblée). " +
            "Renseigne une base jetable distincte de la dev — voir .env.e2e.example.",
        );
    }
    if (connectionString === process.env.DATABASE_URL) {
        throw new Error(
            "E2E_DATABASE_URL pointe la même base que DATABASE_URL (dev) : refus pour ne pas l'écraser.",
        );
    }

    // Schéma à jour sur la base de test.
    execSync("npx prisma migrate deploy", {
        env: {...process.env, DATABASE_URL: connectionString},
        stdio: "inherit",
    });

    const adapter = new PrismaPg({connectionString});
    const prisma = new PrismaClient({adapter});

    try {
        // Reset dans l'ordre des dépendances (enfants d'abord).
        await prisma.comment.deleteMany();
        await prisma.article.deleteMany();
        await prisma.subscription.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.user.deleteMany();

        const passwordHash = bcrypt.hashSync(E2E_USER.password, 10);
        const victor = await prisma.user.create({
            data: {username: E2E_USER.username, email: E2E_USER.email, password: passwordHash},
        });
        const juliette = await prisma.user.create({
            data: {username: AUTHOR_USER.username, email: AUTHOR_USER.email, password: passwordHash},
        });

        const js = await prisma.topic.create({
            data: {name: TOPICS.subscribed, description: "Le langage du web, côté navigateur comme serveur."},
        });
        await prisma.topic.create({
            data: {name: TOPICS.toSubscribe, description: "JavaScript typé statiquement."},
        });
        const python = await prisma.topic.create({
            data: {name: TOPICS.toUnsubscribe, description: "Polyvalent et lisible, roi du scripting."},
        });

        // Victor suit JavaScript (fil non vide) et Python (cible du désabonnement).
        await prisma.subscription.create({data: {userId: victor.id, topicId: js.id}});
        await prisma.subscription.create({data: {userId: victor.id, topicId: python.id}});

        // Deux articles datés dans le thème suivi : permet de vérifier le tri.
        const older = await prisma.article.create({
            data: {
                authorId: juliette.id,
                topicId: js.id,
                title: ARTICLES.older,
                content: "Une closure capture les variables de sa portée englobante. ".repeat(2),
                createdAt: new Date("2026-01-01T10:00:00Z"),
            },
        });
        await prisma.article.create({
            data: {
                authorId: juliette.id,
                topicId: js.id,
                title: ARTICLES.newer,
                content: "async/await simplifie l'écriture du code asynchrone en JavaScript. ".repeat(2),
                createdAt: new Date("2026-02-01T10:00:00Z"),
            },
        });

        await prisma.comment.create({
            data: {authorId: victor.id, articleId: older.id, content: "Très clair, merci !"},
        });
    } finally {
        await prisma.$disconnect();
    }
}
