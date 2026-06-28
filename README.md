# MDD — Monde de Dév

Réseau social à destination des développeurs : on s'abonne à des thèmes de
programmation, on publie des articles, on en discute en commentaires. Le code
de ce dépôt couvre le périmètre du MVP décrit dans `BRIEF.md`.

## Sommaire

- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
- [Lancer l'application](#lancer-lapplication)
- [Tests](#tests)
- [Scripts npm](#scripts-npm)
- [Organisation du code](#organisation-du-code)
- [Fonctionnalités](#fonctionnalités)
- [Documentation et références](#documentation-et-références)

## Stack technique

| Couche | Choix |
| :---- | :---- |
| Framework | Next.js 16 — App Router, Server Components et Server Actions |
| Langage | TypeScript 5 |
| Runtime | Node.js 22 LTS |
| Interface | Tailwind CSS 4 + primitives UI maison (CVA + `tailwind-merge`) |
| Authentification | NextAuth v4 (Credentials, session JWT) + bcrypt |
| Base de données | PostgreSQL |
| ORM | Prisma 7 (adaptateur `@prisma/adapter-pg`) |
| Validation | Zod |
| Tests | Vitest (unitaires et intégration) + Playwright (e2e, audits Lighthouse) |

Le détail et la justification de chaque choix sont consignés dans
`DOCUMENTATION.md`.

## Prérequis

- Node.js 22+ (la version est épinglée dans `.nvmrc`)
- npm
- Docker, pour faire tourner PostgreSQL en local

## Installation

```bash
git clone https://github.com/EnhydraV/ocr-jsld-p5
cd ocr-jsld-p5
npm install
```

## Configuration

Les variables d'environnement sont décrites dans `.env.example`. On part de ce
modèle :

```bash
cp .env.example .env
```

Les variables `DATABASE_*` servent à la fois à `docker-compose.yml` et à la
`DATABASE_URL` (construite par interpolation) que consomme Prisma — une seule
source de vérité pour la connexion. Côté authentification, renseigner
`NEXTAUTH_SECRET` (clé de signature des sessions) et `NEXTAUTH_URL`.

```env
DATABASE_USER='mdd'
DATABASE_PASSWORD='mddpass'
DATABASE_PORT='5432'
DATABASE_NAME='mdd'
DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"

NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Base de données

Démarrer le conteneur PostgreSQL défini dans `docker-compose.yml` :

```bash
docker compose up -d
```

Appliquer les migrations, puis charger les données de démonstration :

```bash
npx prisma migrate deploy
npm run seed
```

Le seed n'est pas qu'un confort : le MVP n'ayant pas de back-office, les thèmes
sont créés exclusivement par le seed. Sans lui, aucun thème n'existe — donc
impossible de s'abonner ou de publier un article.

En développement, `npx prisma migrate dev` régénère le client Prisma, applique
les migrations **et déclenche automatiquement le seed** : une seule commande
suffit, le `npm run seed` ci-dessus devient alors redondant.

## Lancer l'application

```bash
npm run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run test              # tests unitaires (Vitest)
npm run test:integration  # tests d'intégration sur PostgreSQL jetable (Testcontainers)
npm run test:coverage     # tests unitaires avec rapport de couverture
npm run test:e2e          # tests end-to-end (Playwright, Chromium)
```

Les tests d'intégration nécessitent un démon Docker disponible (ils
provisionnent leur propre base).

Les tests end-to-end pilotent l'application complète dans un navigateur. Ils
**vident puis sèment la base ciblée** : ils exigent donc une variable
`E2E_DATABASE_URL` pointant une base **jetable, distincte de la base de dev**
(voir `.env.e2e.example`). Sans cette variable — ou si elle pointe la même base
que `DATABASE_URL` — le lancement échoue volontairement, pour ne pas écraser les
données de développement.

## Scripts npm

| Script | Rôle |
| :---- | :---- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | Analyse ESLint |
| `npm run seed` | Charge les données de démonstration (`prisma/seed.ts`) |
| `npm run test` | Tests unitaires |
| `npm run test:watch` | Tests unitaires en mode watch |
| `npm run test:integration` | Tests d'intégration |
| `npm run test:coverage` | Couverture de tests |
| `npm run test:e2e` | Tests end-to-end |
| `npm run test:e2e:ui` | Playwright en mode interactif |
| `npm run test:e2e:report` | Ouvre le dernier rapport Playwright |
| `npm run test:lighthouse` | Audits Lighthouse |
| `npm run screenshots` | Captures d'écran des vues principales (desktop + mobile) |

## Organisation du code

```
src/
├── app/                 # App Router (Next.js 16)
│   ├── api/             # Routes API (NextAuth)
│   ├── article/         # Consultation et création d'articles
│   ├── feed/            # Fil d'actualité
│   ├── topics/          # Thèmes
│   ├── profile/         # Profil utilisateur
│   ├── login/ register/ # Connexion et inscription
│   └── components/      # Composants d'interface (dont ui/ = primitives maison)
├── lib/                 # Logique métier, un dossier par domaine
│   ├── articles/
│   ├── comments/
│   ├── subscriptions/
│   ├── topics/
│   └── users/
├── errors/              # Erreurs applicatives
└── types/               # Types partagés
prisma/                  # Schéma, migrations et seed
```

Chaque domaine de `src/lib` suit le même découpage en trois fichiers :
`*.dto.ts` (schémas Zod et types), `*.service.ts` (logique métier) et
`*.repository.ts` (accès aux données via Prisma).

## Fonctionnalités

- Inscription et connexion par e-mail **ou** nom d'utilisateur, session
  persistante
- Consultation et modification du profil
- Fil d'actualité alimenté par les abonnements, triable par date
- Liste des thèmes, abonnement et désabonnement
- Publication et lecture d'articles
- Commentaires sur les articles (non récursifs)

## Documentation et références

Documentation interne du projet : `DOCUMENTATION.md` (technique et choix).

Documentations officielles des technologies retenues :

- [TypeScript](https://www.typescriptlang.org/docs/)
- [Next.js](https://nextjs.org/docs) — [React](https://react.dev/learn)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [NextAuth.js](https://next-auth.js.org/getting-started/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
