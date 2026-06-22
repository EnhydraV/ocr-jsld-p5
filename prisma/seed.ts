import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Le seed s'exécute hors du runtime Next : on charge le .env nous-mêmes
// (interpolation des ${...}) avant de construire l'adapter, comme prisma.config.ts.
loadEnvConfig(process.cwd());

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Thèmes de référence. Le brief ne prévoit pas de création de thème par les
// utilisateurs : ce sont des données fixes, alimentées ici.
const topics = [
    // Langages
    {name: "JavaScript", description: "Le langage du web, côté navigateur comme serveur avec Node.js : frameworks, écosystème et bonnes pratiques."},
    {name: "TypeScript", description: "JavaScript typé statiquement : typage strict, meilleur outillage et fiabilité sur les gros projets."},
    {name: "Python", description: "Langage polyvalent et lisible, roi du scripting, de la data science et de l'intelligence artificielle."},
    {name: "Java", description: "Langage objet robuste de l'écosystème JVM : applications d'entreprise, back-end et Android."},
    {name: "C#", description: "Langage objet de la plateforme .NET : applications desktop, web avec ASP.NET et jeux sous Unity."},
    {name: "C++", description: "Langage système performant : moteurs de jeux, calcul intensif et logiciels proches du matériel."},
    {name: "Go", description: "Langage compilé conçu par Google : simplicité, concurrence native et services réseau performants."},
    {name: "Rust", description: "Langage système sûr en mémoire, sans ramasse-miettes : performance et fiabilité sans compromis."},
    {name: "PHP", description: "Pilier du web côté serveur : sites dynamiques, CMS et frameworks comme Laravel et Symfony."},
    {name: "Ruby", description: "Langage élégant orienté productivité, popularisé par le framework web Ruby on Rails."},
    {name: "Swift", description: "Langage moderne d'Apple pour iOS, macOS et au-delà : sûr, rapide et expressif."},
    {name: "Kotlin", description: "Langage concis interopérable avec Java, devenu le choix officiel pour le développement Android."},
    {name: "SQL", description: "Langage des bases de données relationnelles : modélisation, requêtes, jointures et optimisation."},
    // Concepts
    {name: "Intelligence artificielle", description: "Apprentissage automatique, réseaux de neurones et grands modèles de langage : des systèmes qui apprennent."},
    {name: "CI/CD", description: "Intégration et déploiement continus : automatiser tests, builds et mises en production."},
    {name: "DevOps", description: "Culture et outils rapprochant développement et exploitation : automatisation, conteneurs et infrastructure as code."},
    {name: "Cybersécurité", description: "Protéger applications et données : vulnérabilités, cryptographie et bonnes pratiques de sécurité."},
    {name: "Web", description: "Les technologies du web : HTTP, front-end, back-end, accessibilité et performance."},
    {name: "Mobile", description: "Développement d'applications mobiles, natives ou multiplateformes, pour iOS et Android."},
    {name: "Emploi", description: "Carrière de développeur : recherche d'emploi, entretiens techniques, freelance et évolution professionnelle."},
    {name: "UI/UX", description: "Conception d'interfaces et d'expériences utilisateur : ergonomie, accessibilité et design d'interaction."},
];

async function main() {
    // upsert idempotent : le seed peut être relancé sans dupliquer (name est
    // unique). `update` resynchronise la description si on la modifie ici.
    for (const {name, description} of topics) {
        await prisma.topic.upsert({
            where: { name },
            update: { description },
            create: { name, description },
        });
    }
    console.log(`Seed terminé : ${topics.length} thèmes insérés.`);
}

main()
    .catch((error) => {
        console.error("Seed échoué :", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
