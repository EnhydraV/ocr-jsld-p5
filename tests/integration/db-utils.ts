import {prisma} from "@/prisma";

// Helpers de seed et de nettoyage de la base d'intégration. Chaque test part
// d'une base vide (resetDb dans un beforeEach) puis seed exactement ce dont il a
// besoin, pour rester lisible et indépendant.

const VALID_PASSWORD_HASH = "$2b$10$abcdefghijklmnopqrstuv"; // un hash quelconque suffit ici

/**
 * Vide les tables dans l'ordre des dépendances (enfants d'abord) pour respecter
 * les clés étrangères.
 */
export async function resetDb() {
    await prisma.comment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.user.deleteMany();
}

/**
 * Seed un utilisateur du jeu de démonstration (mêmes noms que le seed, en
 * `@mdd.dev`). Le nom sert d'identifiant unique pour email et username.
 */
export function seedUser(name = "victor") {
    return prisma.user.create({
        data: {
            email: `${name}@mdd.dev`,
            username: name,
            password: VALID_PASSWORD_HASH,
        },
    });
}

/** Seed un thème. */
export function seedTopic(name = "TypeScript") {
    return prisma.topic.create({data: {name, description: "Un thème de test"}});
}

/** Seed un article rattaché à un auteur et un thème. */
export function seedArticle(authorId: number, topicId: number, title = "Un titre de test") {
    return prisma.article.create({
        data: {authorId, topicId, title, content: "x".repeat(50)},
    });
}

/** Seed un abonnement (table de jointure). */
export function seedSubscription(userId: number, topicId: number) {
    return prisma.subscription.create({data: {userId, topicId}});
}
