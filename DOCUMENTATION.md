Auteur : **Vincent VANWAELSCAPPEL**\
Version : **0.0.17**\
Date : **28/06/2026**

# Documentation et rapport du projet MDD

## Sommaire

1. [Présentation générale du projet](#presentation-generale)
    1. [Objectifs du projet](#objectifs)
    2. [Périmètre fonctionnel](#perimetre-fonctionnel)
2. [Architecture et conception technique](#architecture)
    1. [Schéma global de l'architecture](#schema-architecture)
    2. [Choix techniques](#choix-techniques)
    3. [API et schémas de données](#api-donnees)
3. [Tests, performance et qualité](#tests-qualite)
    1. [Stratégie de test](#strategie-test)
    2. [Rapport de performance et optimisation](#performance)
    3. [Accessibilité](#accessibilite)
    4. [Revue technique](#revue-technique)
4. [Documentation utilisateur et supervision](#documentation-utilisateur)
    1. [FAQ utilisateur](#faq)
    2. [Supervision et tâches déléguées à l'IA](#supervision-ia)
5. [Annexes](#annexes)
    1. [Captures d'écran de l'UI](#annexes-captures)
    2. [Rapports de tests](#annexes-rapports)
    3. [Autres pièces justificatives](#annexes-autres)

---

<a id="presentation-generale"></a>

## 1. Présentation générale du projet

<a id="objectifs"></a>

### 1.1 Objectifs du projet

Développer un MVP (Minimum Viable Product) d'un réseau social dédié aux développeurs : Monde de Dév (MDD). Ce réseau
social a pour but de les aider à trouver un emploi, à collaborer, à s'informer en les mettant en relation et en leur
permettant de partager leurs savoirs.

Chaque utilisateur pourra poster des articles sur diverses thématiques. Chaque utilisateur peut également s'abonner à
une ou plusieurs de ces thématiques. Il verra alors dans son fil d'actualités les contenus des thématiques auxquelles il
est abonné, dans l'ordre chronologique. Il sera par ailleurs possible de commenter des articles.

<a id="perimetre-fonctionnel"></a>

### 1.2 Périmètre fonctionnel

Les **fonctionnalités livrées** du MVP et leur état d'avancement. L'ensemble du
périmètre fonctionnel défini par le brief est terminé.

| Fonctionnalités                            | Description                                                                                                                                        | Statut   |
|:-------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------|:---------|
| **Création d'un compte utilisateur**       | Formulaire et validation d'inscription                                                                                                             | Terminée |
| **Authentification**                       | Authentification sécurisée par mot de passe, hash du mot de passe, pose du cookie de session                                                       | Terminée |
| **Déconnexion**                            | Suppression du cookie                                                                                                                              | Terminée |
| **Consulter son profil utilisateur**       | Afficher les informations associées à son compte et ses abonnements                                                                                | Terminée |
| **Modifier ses informations de connexion** | Modifier email, nom d'utilisateur et mot de passe                                                                                                  | Terminée |
| **Liste des thèmes**                       | Afficher la liste des thèmes et leur status "abonné" pour l'utilisateur                                                                            | Terminée |
| **Abonnement/Désabonnement à un thème**    | Dans le profil utilisateur, se désabonner d'un thème. Dans la liste des thème s'abonner/se désabonner des thème                                    | Terminée |
| **Rédiger un article**                     | Ecrire un article associé à un thème                                                                                                               | Terminée |
| **Lire le fil d'actualités**               | Lister les articles associés aux thèmes auxquels l'utilisateur a souscrit. Ordonner les articles par date de publication (ascendant ou descendant) | Terminée |
| **Lire un article**                        | Consulter un article et ses commentaires.                                                                                                          | Terminée |
| **Ecrire un commentaire**                  | Ecrire un commentaire associé à un article                                                                                                         | Terminée |

---

<a id="architecture"></a>

## 2. Architecture et conception technique

<a id="schema-architecture"></a>

### 2.1 Schéma global de l'architecture

```mermaid
flowchart TD
    subgraph client["Client (navigateur)"]
        User([Utilisateur])
    end

    subgraph front["Front-end — Next.js App Router"]
        SC["Server Components<br/>rendu côté serveur"]
        CC["Client Components<br/>formulaires, interactions"]
    end

    subgraph comm["Communication front / back"]
        SA["Server Actions — use server<br/>validation Zod + contrôle session"]
        RH["Route Handler NextAuth<br/>/api/auth/[...nextauth]"]
    end

    subgraph metier["Logique métier — lib/"]
        SVC["Services<br/>articles, comments, topics, users"]
    end

    subgraph data["Données"]
        ORM["Prisma ORM"]
        DB[("PostgreSQL")]
    end

    subgraph ext["Services externes"]
        GH["GitHub<br/>versioning"]
    end

    User -->|requête HTTP| SC
    User -->|interactions| CC
    SC -->|appel direct serveur| SVC
    CC -->|appel RPC| SA
    SA --> SVC
    SVC -->|requêtes typées| ORM
    ORM --> DB

    User -->|login / session| RH
    RH -->|adapter users / sessions| ORM

    SC -.->|HTML rendu| User
    SA -.->|données + revalidation| CC

    classDef server fill:#e3f2fd,stroke:#1565c0,color:#0d47a1;
    classDef clientNode fill:#fff3e0,stroke:#e65100,color:#bf360c;
    class SC,SA,RH,SVC,ORM server;
    class CC clientNode;
```

**Légende.** En bleu, le code exécuté côté serveur (Server Components, Server Actions, Route Handler, services métier,
Prisma) ; en orange, le code envoyé au navigateur (Client Components). Trait plein = appel ou flux de données ;
pointillés = réponse renvoyée au client. Les Client Components déclenchent des **Server Actions** — qui valident les
entrées via Zod et vérifient la session avant d'appeler un service `lib/` — tandis que les Server Components appellent
directement les services côté serveur. L'authentification passe par le **Route Handler** dédié de NextAuth.

**Organisation technique.** Le routage et les composants vivent dans `app/` (App Router : un dossier par segment d'URL,
les Server Actions au plus près de leur usage dans des fichiers `actions.ts`). La logique métier est isolée dans `lib/`,
à raison d'un dossier par domaine (`lib/articles/`, `lib/comments/`, `lib/topics/`, `lib/users/`), chacun regroupant son
service, ses schémas Zod et ses types. Ce découplage rend la logique réutilisable par n'importe quel transport (Server
Action aujourd'hui, Route Handler demain) et testable en isolation.

<a id="choix-techniques"></a>

### 2.2 Choix techniques

| Éléments choisis   | Type                             | Lien documentation                                                                                                | Objectif du choix                                                                                          | Justification                                                                                        |
|:-------------------|:---------------------------------|:------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------|
| **Typescript**     | Langage                          | https://www.typescriptlang.org/docs/                                                                              | Langage au typage strict                                                                                   | Détecter les erreurs avant l'exécution                                                               |
| **Next.js, React** | Framework Full-stack             | https://nextjs.org/docs<br/>https://react.dev/learn<br/>https://nextjs.org/docs/app/getting-started/updating-data | Architecture unifiée, Server Components et Server Actions (communication front/back sans API REST séparée) | Performance, typage de bout en bout, moins de code de liaison ; logique métier découplée dans `lib/` |
| **PostgreSQL**     | Moteur de Base de données        | https://www.postgresql.org/docs/                                                                                  | Persistance des données                                                                                    | Performances, support des transactions                                                               |
| **Prisma**         | Object-relational mappings (ORM) | https://www.prisma.io/docs<br/>https://www.prisma.io/docs/guides/frameworks/nextjs                                | Couche d'abstraction des données                                                                           | Abstraction des requêtes, agnostique au moteur de BDD sous-jacent, typage et migrations générés      |
| **Zod**            | Validation                       | https://zod.dev/                                                                                                  | Validation des données                                                                                     | Simplicité et lisibilité de la syntaxe, une source de vérité (cf. z.infer)                           |
| **NextAuth.js**    | Bibliothèque d'authentification  | https://next-auth.js.org/getting-started/introduction                                                             | Sécurisation de l'application                                                                              | Support d'un vaste choix de méthodes d'authentification (future proof)                               |
| **Tailwind**       | Framework CSS                    | https://tailwindcss.com/docs                                                                                      | Styliser rapidement                                                                                        | Gestion du responsive, styles et composants regroupés via classes utilitaires                        |
| **GitHub**         | Collaboration                    | https://www.github.com                                                                                            | Versionning du code, collaboration                                                                         | Gratuit, standard de l'industrie                                                                     |

<a id="api-donnees"></a>

### 2.3 API et schémas de données

La logique serveur suit le principe de l'App Router, qui sépare nettement écritures et lectures :

* **Mutations → Server Actions** (`"use server"`, fichiers `*.action.ts`) : déclenchées depuis les formulaires / boutons
  des Client Components. Elles **valident** (Zod), **contrôlent la session**, délèguent au service métier, puis
  **redirigent** ou **revalident le cache**. Elles ne renvoient un état JSON que pour réafficher une erreur de
  formulaire (`useActionState`).
* **Lectures → Server Components** : il n'y a **pas** de Server Action de lecture. Les pages serveur appellent
  directement la couche service (`lib/**/*.service.ts`), qui renvoie les données au rendu — une lecture n'a pas besoin
  du round-trip d'une action.
* **Authentification → Route Handler** `/api/auth/[...nextauth]` (NextAuth) ; `signIn` / `signOut` sont déclenchés côté
  client (cf. §2.1), pas via une Server Action dédiée.

**Server Actions (mutations)**

| Server Action       | Opération                      | Entrée                                               | Retour / effet                                                                          |
|:--------------------|:-------------------------------|:-----------------------------------------------------|:----------------------------------------------------------------------------------------|
| `registerAction`    | Inscription                    | FormData (username, email, password)                 | `redirect` `/login?registered=1` ; sinon `RegisterState` (message d'erreur)             |
| `profileAction`     | Mise à jour du profil connecté | FormData (username, email, password optionnel)       | `ProfileState` `{success, values}` + `revalidatePath('/profile')` ; sinon état d'erreur |
| `postAction`        | Publication d'un article       | FormData (topicId, title, content)                   | `redirect` `/article/{id}?created=1` ; sinon `PostState` (erreur)                       |
| `commentAction`     | Ajout d'un commentaire         | `articleId` (lié via `.bind()`) + FormData (content) | `redirect` `/article/{id}?comment=1` ; sinon `CommentState` (erreur)                    |
| `subscribeAction`   | Abonnement à un thème          | `topicId` (lié via `.bind()`)                        | `void` + `revalidatePath` (`/topics`, `/feed`, `/profile`)                              |
| `unsubscribeAction` | Désabonnement d'un thème       | `topicId` (lié via `.bind()`)                        | `void` + `revalidatePath` (`/topics`, `/feed`, `/profile`)                              |

Les erreurs *attendues* (Zod, `AppError`) sont traduites en message par le helper commun `toActionError`
(`lib/actionError.ts`).

**Lectures (Server Components → couche service)**

| Méthode service                             | Opération                                | Page / usage                          |
|:--------------------------------------------|:-----------------------------------------|:--------------------------------------|
| `articlesService.getFeedArticles(order?)`   | Articles des thèmes suivis, tri par date | `/feed`                               |
| `articlesService.getArticleById(id)`        | Article + auteur + thème + commentaires  | `/article/[id]`                       |
| `topicsService.getTopicsWithSubscription()` | Tous les thèmes + statut d'abonnement    | `/topics`                             |
| `topicsService.getSubscribedTopics()`       | Thèmes suivis de l'utilisateur           | `/profile`                            |
| `topicsService.getAllTopics()`              | Tous les thèmes (sans statut)            | menu déroulant de rédaction d'article |

*Reste à implémenter : la lecture du profil de l'utilisateur connecté (`getUserProfile` du périmètre initial), pour la
page `/profile` ; l'identité provient déjà de la session via `getCurrentUserId`.*

Le diagramme entité-association ci-dessous représente les modèles Prisma et leurs relations.

```mermaid
erDiagram
    TOPIC ||--o{ SUBSCRIPTION : "ciblé par"
    USER ||--o{ SUBSCRIPTION : "souscrit"
    USER ||..o{ ARTICLE : "rédige"
    TOPIC ||..o{ ARTICLE : "catégorise"
    ARTICLE ||..o{ COMMENT : "reçoit"
    USER ||..o{ COMMENT : "rédige"

    TOPIC {
        int id PK
        string name UK
        string description
        datetime createdAt
        datetime updatedAt
    }

    USER {
        int id PK
        string email UK
        string username UK
        string password
        datetime createdAt
        datetime updatedAt
    }
    
    SUBSCRIPTION {
        int userId PK,FK
        int topicId PK,FK
        datetime createdAt
    }

    ARTICLE {
        int id PK
        int authorId FK
        int topicId FK
        string title
        string content
        datetime createdAt
        datetime updatedAt
    }
    COMMENT {
        int id PK
        int authorId FK
        int articleId FK
        string content
        datetime createdAt
        datetime updatedAt
    }
```

**Légende.** `PK` = clé primaire, `FK` = clé étrangère, `UK` = contrainte d'unicité. Le symbole `||--o{` se lit « un et
un seul » côté barre, « zéro ou plusieurs » côté patte d'oie. Trait plein = relation **identifiante** (la clé étrangère
fait partie de la clé primaire) : c'est le cas de `SUBSCRIPTION`, dont la clé composite `(userId, topicId)` matérialise
l'abonnement et interdit tout doublon. Trait pointillé = relation **non identifiante** (la clé étrangère est un simple
attribut), pour les liens auteur et catégorie. La table `SUBSCRIPTION` porte la relation plusieurs-à-plusieurs entre
`USER` et `TOPIC`.

---

<a id="tests-qualite"></a>

## 3. Tests, performance et qualité

<a id="strategie-test"></a>

### 3.1 Stratégie de test

La couche **logique côté serveur** (services, repositories, DTO Zod, Server
Actions, gestion d'erreurs) est testée en priorité, car c'est elle qui porte les
règles métier (unicité, validation du mot de passe, identité issue de la session,
404 sur article inexistant…). Les composants React et les pages relèvent des
tests **e2e**, prévus dans un second temps.

Deux niveaux complémentaires, sous **Vitest** :

* **Unitaire** — chaque service est testé isolément : le client Prisma est
  remplacé par un mock profond (`vitest-mock-extended`) et la session
  (`getCurrentUserId`) est stubée. Les tests traversent les *vrais* repositories
  (injectés par défaut dans les services), qui sont donc couverts sans base
  réelle. S'y ajoutent les schémas Zod, le helper `toActionError`, `AppError`,
  la configuration NextAuth (`authorize`, callbacks) et les Server Actions.
* **Intégration** — les mêmes services rejoués contre une **vraie base
  PostgreSQL éphémère** (Testcontainers, image `postgres:16-alpine`, migrations
  Prisma appliquées au démarrage) : on valide les requêtes réelles, les
  contraintes d'unicité, les `include` de relations et le double abonnement sans
  doublon. Nécessite Docker.

Seuil de couverture fixé à **75 %** (statements / branches / functions / lines)
sur la couche `src/lib` + `src/errors` ; **atteint** : ~99 % des instructions et
~81 % des branches sur le périmètre testé (75 tests unitaires).

Un troisième niveau, **end-to-end** (Playwright), pilote l'application complète
dans un navigateur (Chromium) sur les parcours critiques du brief : l'app est
lancée par Playwright, une base PostgreSQL jetable est préparée puis semée avant
la suite, et la session est mutualisée via un état d'authentification enregistré.
Comme l'intégration, il nécessite Docker (PostgreSQL).

Commandes : `npm test` (unitaire), `npm run test:coverage` (couverture),
`npm run test:integration` (intégration, Docker requis), `npm run test:e2e`
(end-to-end, Docker requis).

| Type de test       | Outil / framework                    | Portée                                                                                                                     | Résultats                                           |
|:-------------------|:-------------------------------------|:---------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------|
| Test unitaire      | Vitest + vitest-mock-extended        | Services, repositories, DTO, Server Actions, auth, erreurs                                                                 | 75 tests ✓ — couverture ~99 % stmts / 81 % branches |
| Test d'intégration | Vitest + Testcontainers (PostgreSQL) | Services rejoués sur vraie base (relations, contraintes, double abonnement sans doublon)                                   | 13 tests (exécution locale, Docker requis)          |
| Test e2e           | Playwright (Chromium)                | Parcours critiques : inscription, connexion, fil + tri, abonnement, article, commentaire, profil, déconnexion, 404, mobile | 16 tests (exécution locale, Docker requis)          |

**Rapport de couverture** (sortie de `npm run test:coverage`, fournisseur V8),
par domaine de `src/lib` et `src/errors` :

| Périmètre            | % Instr. | % Branches | % Fonctions | % Lignes |
|:---------------------|:--------:|:----------:|:-----------:|:--------:|
| **Total**            | **98,68** | **81,35** | **96,15** | **98,66** |
| `errors`             | 100 | 100 | 100 | 100 |
| `lib` (auth, erreurs, utils) | 100 | 93,75 | 100 | 100 |
| `lib/articles`       | 100 | 66,66 | 100 | 100 |
| `lib/comments`       | 100 | 80 | 100 | 100 |
| `lib/subscriptions`  | 100 | 100 | 100 | 100 |
| `lib/topics`         | 100 | 100 | 100 | 100 |
| `lib/users`          | 96,15 | 77,77 | 87,5 | 96,15 |

Le seuil de validation (75 % sur chaque métrique, configuré dans
`vitest.coverage.config.ts`) est dépassé partout. Les branches non couvertes sont
essentiellement les blocs `catch` d'erreur *inattendue* des Server Actions (chemins
défensifs, par nature difficiles à provoquer). Le rapport HTML complet est généré
dans `coverage/` ; une capture figure en annexe §5.

<a id="performance"></a>

### 3.2 Rapport de performance et optimisation

La performance résulte d'abord des **choix d'architecture** et de l'application des
bonnes pratiques tout au long du développement, avant toute optimisation a
posteriori. Elle est ensuite **vérifiée en continu** par des audits Lighthouse
automatisés.

#### Audits Lighthouse automatisés

Une suite dédiée (Playwright + `playwright-lighthouse`, commande
`npm run test:lighthouse`) audite **sept pages** — accueil, connexion, inscription,
fil, thèmes, rédaction d'article, profil — chacune en **desktop et en mobile**,
soit quatorze audits. Les quatre catégories (performance, accessibilité, bonnes
pratiques, SEO) sont mesurées, mais seul le **score d'accessibilité est bloquant** :
un test échoue si une page repasse sous le seuil, exactement comme un test
classique. Les trois autres catégories sont informatives — la performance en
particulier dépend trop de la machine d'exécution pour servir de garde-fou. Les
rapports HTML/JSON sont produits dans `lighthouse-report/` et un tableau
récapitulatif est affiché en fin de run. Le détail accessibilité est en §3.3.

#### Optimisations en place

* **Rendu côté serveur par défaut** : les lectures (fil, thèmes, profil, détail
  d'article) sont des **Server Components**. Le HTML arrive prêt à afficher et le
  JavaScript envoyé au navigateur reste minimal — seuls les éléments interactifs
  (formulaires, menu) sont des Client Components.
* **Invalidation ciblée du cache** : les mutations passent par des Server Actions
  qui appellent `revalidatePath` sur les seules routes concernées (`/feed`,
  `/topics`, `/profile`) plutôt que de forcer un rechargement complet côté client.
  `force-dynamic` n'est posé que là où c'est nécessaire (rédaction d'article).
* **Polices auto-hébergées** : `next/font` (Geist) sert les polices depuis le
  domaine de l'app — pas de requête tierce, pas de décalage de mise en page (CLS).
* **Images optimisées** : le logo passe par `next/image` (formats modernes,
  dimensions explicites, chargement maîtrisé).

#### Point d'amélioration identifié

* **Charge utile du fil** : `ArticleCard` tronque l'extrait *à l'affichage* via
  `line-clamp-4` (CSS), mais le contenu intégral de chaque article transite dans le
  HTML. Acceptable au volume du seed ; à remplacer par un extrait borné calculé
  côté serveur si la volumétrie augmente (cf. revue technique §3.4).

#### Résultats Lighthouse

Sur le poste de développement (`npm run build && npm run start`, base semée), les
**sept pages atteignent 100/100 dans les quatre catégories, en desktop comme en
mobile** — soit quatorze audits. Sortie du récapitulatif de `npm run test:lighthouse` :

| Page            | Facteur | Performance | Accessibilité | Bonnes pratiques | SEO |
|:----------------|:--------|:-----------:|:-------------:|:----------------:|:---:|
| `/`             | desktop | 100 | 100 | 100 | 100 |
| `/login`        | desktop | 100 | 100 | 100 | 100 |
| `/register`     | desktop | 100 | 100 | 100 | 100 |
| `/feed`         | desktop | 100 | 100 | 100 | 100 |
| `/topics`       | desktop | 100 | 100 | 100 | 100 |
| `/article/new`  | desktop | 100 | 100 | 100 | 100 |
| `/profile`      | desktop | 100 | 100 | 100 | 100 |
| `/`             | mobile  | 100 | 100 | 100 | 100 |
| `/login`        | mobile  | 100 | 100 | 100 | 100 |
| `/register`     | mobile  | 100 | 100 | 100 | 100 |
| `/feed`         | mobile  | 100 | 100 | 100 | 100 |
| `/topics`       | mobile  | 100 | 100 | 100 | 100 |
| `/article/new`  | mobile  | 100 | 100 | 100 | 100 |
| `/profile`      | mobile  | 100 | 100 | 100 | 100 |

Les rapports HTML détaillés correspondants sont produits dans `lighthouse-report/`
(une capture du récapitulatif figure en annexe §5).

#### Portée et limites de ces scores

Un score de 100 est un bon indicateur, pas une garantie absolue ; il faut le lire
pour ce qu'il est :

* **Données de laboratoire, pas de terrain** : Lighthouse mesure un chargement
  *synthétique*, sur une machine et un profil de bridage donnés. Il ne reflète pas
  l'expérience réelle des utilisateurs (diversité des réseaux, des appareils, état
  du cache) que livreraient des données de terrain type CrUX.
* **Variabilité** : les scores fluctuent d'un run à l'autre (bridage CPU, charge de
  la machine, aléa réseau). Les nôtres sont relevés en local, sur un volume de seed
  limité, dans des conditions favorables.
* **Audit partiel, surtout en accessibilité** : les vérifications automatiques ne
  couvrent qu'une partie des critères WCAG. 100/100 ne dispense pas du test manuel
  (navigation clavier, lecteur d'écran) — d'où le complément WAVE + clavier décrit
  en §3.3.
* **Catégories heuristiques** : « bonnes pratiques » et « SEO » sont des check-lists ;
  un 100 signale l'absence de signaux négatifs connus, pas une optimisation
  exhaustive.

En résumé, ces audits servent surtout de **garde-fou contre les régressions** — et
de façon bloquante pour l'accessibilité — plus que de preuve de performance en
production.

<a id="accessibilite"></a>

### 3.3 Accessibilité

L'accessibilité a été mesurée via les audits **Lighthouse** (catégorie *Accessibility*) et **Wave**
complétés par un test manuel de la **navigation au clavier** sur les parcours
principaux. L'audit initial plafonnait à **96/100** ; les corrections décrites
ci-dessous ont permis d'atteindre **100/100**. Des erreurs dans Wave ont été relevées. Les corrections
ont permis d'atteindre **10/10** sur toutes les pages

#### Points relevés

* **Piège au clavier absent sur le menu mobile** : une fois le panneau de
  navigation (burger) ouvert, la tabulation pouvait s'échapper vers le contenu
  situé derrière l'overlay, alors que ce contenu était visuellement masqué. Le
  focus se « perdait » hors du dialogue, en infraction avec les critères WCAG
  *2.1.2 (No Keyboard Trap)* et *2.4.3 (Focus Order)*.
* **Éléments focusables dans une zone masquée** : le panneau, maintenu monté pour
  l'animation de glissement, conservait ses liens dans l'ordre de tabulation même
  fermé
* **Fermeture du menu peu accessible** : le panneau ne proposait pas de commande
  de fermeture explicite et clairement atteignable au clavier.
* **Champs sans labels** : la maquette ne prévoyait pas de labels sur les champs
  de rédaction des articles et commentaires.

#### Actions correctives appliquées

* **Piège à focus** : le panneau est désormais un véritable dialogue modal
  (`role="dialog"`, `aria-modal="true"`) dont le focus clavier est confiné par la
  bibliothèque **`focus-trap-react`**. Tant que le menu est ouvert, `Tab` /
  `Shift+Tab` bouclent à l'intérieur ; le focus entre dans le panneau à l'ouverture
  et revient au bouton burger à la fermeture. Les touches *Échap* et un clic sur
  l'overlay le referment.
* **Mise à l'écart de la zone fermée** : le bricolage `tabIndex` conditionnel par
  élément est remplacé par l'attribut `inert` posé sur le conteneur lorsque le menu
  est fermé, le retirant d'un seul tenant du clavier, des clics et de l'arbre
  d'accessibilité.
* **Bouton de fermeture explicite** : ajout d'une croix (`aria-label="Fermer le
  menu"`, `aria-keyshortcuts="Escape"`) en tête du panneau, et annonce de l'état du
  burger via `aria-expanded` / `aria-haspopup="dialog"`.
* **Lien de navigation redondant** : un item pointant vers la page courante est
  désormais rendu comme un `<span aria-current="page">` non cliquable plutôt qu'un
  lien vers soi-même (suppression de l'alerte *redundant link* de WAVE et
  signalement de la position courante aux lecteurs d'écran).
* **Labels de formulaire** : les champs du formulaire de rédaction d'article
  (thème, titre, contenu) reçoivent un `<label>` relié par `htmlFor`/`id`, en
  complément du placeholder, supprimant l'alerte *missing form label* de WAVE.

---

<a id="revue-technique"></a>

### 3.4 Revue technique

Synthèse critique du code à l'état actuel du projet.

#### Points forts

* **Typage strict de bout en bout** : `strict` activé, types Prisma générés et
  partagés entre la couche d'accès aux données et le front. Les entrées des
  Server Actions sont validées par Zod (`RegisterSchema`, `UpdateProfileSchema`,
  `ArticleSchema`, `CommentSchema`) avant tout contact avec la base.
* **Séparation des responsabilités** : découpage par domaine en
  `repository` / `service` / `dto` sous `src/lib/`. L'identité de l'utilisateur
  provient systématiquement de la session (`getCurrentUserId`), jamais d'un
  paramètre client, ce qui ferme la porte à l'usurpation d'identité par
  falsification de formulaire.
* **Gestion d'erreur centralisée** : le mapping erreur → message des Server
  Actions est factorisé dans `src/lib/actionError.ts` (`toActionError`),
  supprimant la duplication des blocs `catch` Zod / `AppError`.

#### Points à améliorer

* **Charge utile du fil d'actualité** : `ArticleCard` tronque l'extrait *à
  l'affichage* via `line-clamp-4` (CSS `-webkit-line-clamp`), mais le contenu
  intégral de chaque article transite malgré tout dans le HTML envoyé au client.
  Pour un fil dense, cela gonfle inutilement la charge réseau. Acceptable au
  périmètre du MVP (volume de seed limité) ; à traiter par un extrait calculé
  côté serveur (`excerpt` borné, coupé sur un espace) si la volumétrie augmente.
* **Course résiduelle (TOCTOU)** : le pré-check d'existence de la relation dans
  `addArticle` / `addComment` laisse une fenêtre entre la vérification et
  l'insertion. La contrainte de clé étrangère en base reste le garde-fou réel.
* **Intégration continue (CI) non outillée** : le projet est versionné sous Git,
  mais aucun pipeline n'exécute encore automatiquement le lint, le typage et les
  tests à chaque *push* / *pull request*. Les vérifications restent manuelles
  (`npm run lint`, `tsc --noEmit`, `npm test`). Une CI GitHub Actions (lint + `tsc`
  + tests unitaires sur chaque PR, l'intégration/e2e nécessitant un service
  PostgreSQL) constituerait le prochain garde-fou anti-régression.

#### Actions correctives appliquées

* Centralisation des schémas Zod et du helper d'erreur (`actionError.ts`).
* Correction de `getArticleById` (appelait `repo.feed` au lieu de
  `repo.findById`) et durcissement des écritures (validation Zod + insertion
  typée en `*UncheckedCreateInput` + pré-check d'existence renvoyant un 404
  propre plutôt qu'un 500 sur violation de clé étrangère).
* Mutualisation du formulaire de compte (`AccountForm`) entre inscription et
  profil, paramétré par props (mot de passe requis ou non).

---

<a id="documentation-utilisateur"></a>

## 4. Documentation utilisateur et supervision

<a id="faq"></a>

### 4.1 FAQ utilisateur

Section d'aide destinée aux utilisateurs internes, au format **Question / Réponse**.

Q : Comment créer un compte ?

R : Cliquez sur « S'inscrire », renseignez votre e-mail, un nom d'utilisateur et un
mot de passe, puis validez. Vous êtes ensuite redirigé vers la page de connexion
pour vous identifier.

Q : Quelles sont les règles pour le mot de passe ?

R : Au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un
caractère spécial. Ces règles sont vérifiées côté serveur lors de l'inscription et
de la modification du profil.

Q : Mes données personnelles sont-elles protégées ?

R : Oui. Nous ne stockons que le strict nécessaire au service (e-mail, nom
d'utilisateur, mot de passe). Le mot de passe n'est **jamais** conservé en clair :
il est haché (bcrypt) et reste illisible, y compris pour l'équipe technique. Votre
session est protégée par un jeton signé. En cas de doute sur la sécurité de votre
compte, changez votre mot de passe depuis votre profil.

Q : Comment modifier ou faire supprimer mes informations ?

R : Vous pouvez modifier votre e-mail, votre nom d'utilisateur et votre mot de
passe à tout moment depuis la page **Profil**. Pour la suppression du compte et de
ses données — non encore disponible en libre-service sur cette version — adressez
votre demande au support, conformément à votre droit à l'effacement (RGPD).

Q : Que faire si l'application ne charge pas ?

R : Rafraîchissez la page. Si le problème persiste, vérifiez votre connexion ou
contactez le support technique.

<a id="supervision-ia"></a>

### 4.2 Supervision et tâches déléguées à l'IA

Tâches confiées à l'IA (assistant de codage) et manière dont leur travail a été
**revérifié, validé ou corrigé**. Le tableau ci-dessous en synthétise les
principales.

| Tâche déléguée                                                                                                                                                                                                                                     | Outil / collaborateur | Objectif                                                                                                                                         | Vérification effectuée                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mise en place de la documentation (sommaire cliquable, ancres PDF-compatibles, fichiers de suivi)                                                                                                                                                  | Claude                | Documentation navigable et traçabilité du projet                                                                                                 | Ouverture de `DOCUMENTATION.md` sur GitHub, test de chaque lien du sommaire et relecture du contenu généré                                                                                                                                                                                                                                                                                                                                                                                                        |
| Revue critique du tableau des choix techniques (complétude, justifications, ordre, coquilles)                                                                                                                                                      | Claude                | Crédibiliser la section « Choix techniques »                                                                                                     | Validation point par point des remarques, arbitrage des reformulations conservées et relecture du tableau final                                                                                                                                                                                                                                                                                                                                                                                                   |
| Génération des diagrammes ERD et d'archtecture                                                                                                                                                                                                     | Claude                | Réalisation de diagrammes compatibles avec mon IDE et Github dans la documentation                                                               | Validation de la suggestion du format mermaid, vérification de la cohérence et lisibilité des diagrammes                                                                                                                                                                                                                                                                                                                                                                                                          |
| Rédaction des données de démonstration du seed (6 utilisateurs, 63 articles de 3 paragraphes, 3 commentaires par article)                                                                                                                          | Claude                | Disposer d'un jeu de données réaliste pour développer et tester le fil et le détail d'un article                                                 | Vérification des champs face à `schema.prisma`, contrôle de l'idempotence (upsert users + purge/recréation articles et commentaires), respect de la règle « commentaires postés par des non-auteurs distincts », conformité du mot de passe de dev à la politique du brief et relecture du contenu rédigé                                                                                                                                                                                                         |
| Intégration des pages connectées sur la couche métier : `/topics`, `/profile`, `/feed` puis détail d'article `/article/[id]` (lecture + formulaire de commentaire) et primitives associées (`AccountForm`, `ArticleCard`, `TopicCard`, `Textarea`) | Claude                | Brancher le front sur les services et Server Actions déjà en place                                                                               | Relecture du flux `getArticleById` → rendu → `commentAction.bind()`, confrontation à la maquette, contrôle du `notFound()` sur id invalide/article absent et de l'ordre des arguments liés `(articleId, prev, formData)`, cohérence des lectures avec le tableau des server actions                                                                                                                                                                                                                               |
| Mise en place de la suite de tests Vitest (unitaires + intégration) sur la couche serveur                                                                                                                                                          | Claude                | Tester la logique métier et atteindre le seuil de couverture de 75 %                                                                             | Exécution de `npm run test:coverage` (75 tests au vert, ~99 % stmts / 81 % branches) et `tsc --noEmit` sans erreur ; relecture des assertions face au comportement attendu (codes 401/404/409, mot de passe haché jamais en clair, identité issue de la session, double abonnement sans doublon) ; vérification que les tests d'intégration ciblent bien le conteneur Postgres et non le `.env` local                                                                                                             |
| Mise en place de la suite de tests end-to-end Playwright (16 scénarios) sur les parcours critiques du brief                                                                                                                                        | Claude                | Valider le comportement réel de l'application de bout en bout (UI → Server Actions → base)                                                       | Cartographie préalable de l'UI réelle pour des sélecteurs accessibles (`getByRole`/`getByLabel`/placeholder), validation du parsing des specs (`playwright test --list`, 16 tests) et `tsc --noEmit` sans erreur ; relecture de chaque scénario face aux libellés/routes/bannières exacts des composants ; contrôle du seed déterministe, isolation des données mutées, et garde-fou `E2E_DATABASE_URL` obligatoire (base jetable distincte de la dev) ; exécution complète de la suite sur un PostgreSQL jetable |
| Rédaction du README.md sur la base du template proposé                                                                                                                                                                                             | Claude                | Résumer le contenu du projet et donner les commandes et opération principales permettant de lancer le projet et de reprendre le développement    | Confrontation de chaque section au code réel (`package.json`, `docker-compose.yml`, `.env.example`, `prisma.config.ts`, arborescence `src/`), test des procédures mentionnées                                                                                                                                                                                                                                                                                                                                     |
| Mise en place de l'automatisation des mesures de performance lighthouse avec Playwright                                                                                                                                                            | Claude                | Automatiser les mesures pour repérer plus facilement les régressions des mesures                                                                    | Test de la commande, vérification de la cohérence du résultat avec les résultats observés dans Chrome. Elargissement du scope des tests (perf, mobile)                                                                                                                                                                                                                                                                                                                                                            |

---

<a id="annexes"></a>

## 5. Annexes

<a id="annexes-captures"></a>

### 5.1 Captures d'écran de l'UI

Vues principales de l'application, générées automatiquement (`npm run screenshots`,
suite Playwright dédiée), en **desktop** et **mobile** pour illustrer le responsive.

| Vue | Desktop | Mobile |
|:----|:-------:|:------:|
| Accueil (déconnecté) | <img src="docs/screenshots/desktop/accueil.png" width="440" alt="Accueil — desktop"> | <img src="docs/screenshots/mobile/accueil.png" width="150" alt="Accueil — mobile"> |
| Connexion | <img src="docs/screenshots/desktop/connexion.png" width="440" alt="Connexion — desktop"> | <img src="docs/screenshots/mobile/connexion.png" width="150" alt="Connexion — mobile"> |
| Inscription | <img src="docs/screenshots/desktop/inscription.png" width="440" alt="Inscription — desktop"> | <img src="docs/screenshots/mobile/inscription.png" width="150" alt="Inscription — mobile"> |
| Fil d'actualité | <img src="docs/screenshots/desktop/fil.png" width="440" alt="Fil d'actualité — desktop"> | <img src="docs/screenshots/mobile/fil.png" width="150" alt="Fil d'actualité — mobile"> |
| Liste des thèmes | <img src="docs/screenshots/desktop/themes.png" width="440" alt="Thèmes — desktop"> | <img src="docs/screenshots/mobile/themes.png" width="150" alt="Thèmes — mobile"> |
| Détail d'un article | <img src="docs/screenshots/desktop/article-detail.png" width="440" alt="Détail d'article — desktop"> | <img src="docs/screenshots/mobile/article-detail.png" width="150" alt="Détail d'article — mobile"> |
| Rédaction d'un article | <img src="docs/screenshots/desktop/redaction-article.png" width="440" alt="Rédaction — desktop"> | <img src="docs/screenshots/mobile/redaction-article.png" width="150" alt="Rédaction — mobile"> |
| Profil | <img src="docs/screenshots/desktop/profil.png" width="440" alt="Profil — desktop"> | <img src="docs/screenshots/mobile/profil.png" width="150" alt="Profil — mobile"> |

<a id="annexes-rapports"></a>

### 5.2 Rapports de tests

Synthèses reproduites ici pour lecture directe ; détails et commentaires en §3.1
(stratégie) et §3.2 (performance). Rapports HTML complets générés dans `coverage/`
et `lighthouse-report/`.

**Couverture** (`npm run test:coverage`, fournisseur V8) — seuil de validation 75 %
sur chaque métrique, dépassé partout :

| Périmètre            | % Instr. | % Branches | % Fonctions | % Lignes |
|:---------------------|:--------:|:----------:|:-----------:|:--------:|
| **Total**            | **98,68** | **81,35** | **96,15** | **98,66** |
| `errors`             | 100 | 100 | 100 | 100 |
| `lib` (auth, erreurs, utils) | 100 | 93,75 | 100 | 100 |
| `lib/articles`       | 100 | 66,66 | 100 | 100 |
| `lib/comments`       | 100 | 80 | 100 | 100 |
| `lib/subscriptions`  | 100 | 100 | 100 | 100 |
| `lib/topics`         | 100 | 100 | 100 | 100 |
| `lib/users`          | 96,15 | 77,77 | 87,5 | 96,15 |

**Lighthouse** (`npm run test:lighthouse`) — 7 pages auditées en desktop et mobile,
**100/100 partout** :

| Page            | Facteur | Performance | Accessibilité | Bonnes pratiques | SEO |
|:----------------|:--------|:-----------:|:-------------:|:----------------:|:---:|
| `/`             | desktop | 100 | 100 | 100 | 100 |
| `/login`        | desktop | 100 | 100 | 100 | 100 |
| `/register`     | desktop | 100 | 100 | 100 | 100 |
| `/feed`         | desktop | 100 | 100 | 100 | 100 |
| `/topics`       | desktop | 100 | 100 | 100 | 100 |
| `/article/new`  | desktop | 100 | 100 | 100 | 100 |
| `/profile`      | desktop | 100 | 100 | 100 | 100 |
| `/`             | mobile  | 100 | 100 | 100 | 100 |
| `/login`        | mobile  | 100 | 100 | 100 | 100 |
| `/register`     | mobile  | 100 | 100 | 100 | 100 |
| `/feed`         | mobile  | 100 | 100 | 100 | 100 |
| `/topics`       | mobile  | 100 | 100 | 100 | 100 |
| `/article/new`  | mobile  | 100 | 100 | 100 | 100 |
| `/profile`      | mobile  | 100 | 100 | 100 | 100 |

<a id="annexes-autres"></a>

### 5.3 Autres pièces justificatives

* **Analyse des besoins front-end** : [maquettes de Juana (desktop et mobile)](https://www.figma.com/design/Rflr3TVBog35BNMnn0DF09/Maquettes-MDD--desktop-et-mobile-?node-id=0-1&p=f&t=lEB8bmSebEkK3FjM-0)
  et périmètre fonctionnel (§1.2), respectés écran par écran.
* **Définition des données** : diagramme entité-association et contrat des Server
  Actions (§2.3), schéma `prisma/schema.prisma` et règles de validation Zod
  (`src/lib/**/*.dto.ts`).
* **Rapport de revue technique** : revue critique du code (§3.4).
