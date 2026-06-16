Auteur : **Vincent VANWAELSCAPPEL**\
Version : **0.0.3**\
Date : **12/06/2026**

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
    3. [Revue technique](#revue-technique)
4. [Documentation utilisateur et supervision](#documentation-utilisateur)
    1. [FAQ utilisateur](#faq)
    2. [Supervision et tâches déléguées à l'IA](#supervision-ia)
5. [Annexes](#annexes)

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

Présentez les **fonctionnalités livrées** (liste synthétique), en précisant leur état (terminée / en cours / à venir).

| Fonctionnalités                      | Description                                         | Statut   |
|:-------------------------------------|:----------------------------------------------------|:---------|
| **Création d'un compte utilisateur** | Formulaire et validation d'inscription              | En cours |
| **Authentification**                 | Sécurisation                                        |          |
| **Publication d'un article**         | Gestion CRUD via Server Actions                     |          |
| **Commentaires**                     | Association article/commentaires (Prisma Relations) |          |

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
        GH["GitHub<br/>versioning + CI/CD"]
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
| **GitHub**         | Collaboration                    | https://www.github.com                                                                                            | Versionning du code, collaboration, CI                                                                     | Gratuit, standard de l'industrie                                                                     |

<a id="api-donnees"></a>

### 2.3 API et schémas de données

Présentez ici la **conception et la structuration de votre logique serveur** (Server Actions ou Route Handlers) :

* Server Actions créées,
* Types d'opérations (Query/Mutation),
* exemples d'objets retournés,
* schémas de données Prisma (modèles, relations, contraintes).

| Server Action     | Type \*  | Description                                                                 | Retour / Réponse                  |
|:------------------|:---------|:----------------------------------------------------------------------------|:----------------------------------|
| login †           | Mutation | Authentifie un utilisateur                                                  | Cookie                            |
| logout †          | Mutation | Déconnecte un utilisateur                                                   | Cookie                            |
| register          | Mutation | Enregistre un utilisateur                                                   | JSON - succès de l'enregistrement |
| getUserProfile    | Query    | Détail de l'utilisateur connecté                                            | JSON - profil utilisateur         |
| updateUserProfile | Mutation | Met à jour informations de l'utilisateur connecté                           | JSON - succès de la mise à jour   |
| getTopics         | Query    | Récupère la liste des thèmes et leur statut d'abonnement pour l'utilisateur | JSON - liste des thèmes           |
| subscribeTopic    | Mutation | Abonne l'utilisateur au thème                                               | JSON - liste des thèmes           |
| unsubscribeTopic  | Mutation | Désabonne l'utilisateur du thème                                            | JSON - liste des thèmes           |
| getFeed           | Query    | Récupère les articles du fil, tri configurable                              | JSON - liste d'articles           |
| addArticle        | Mutation | Ajouter un article                                                          | JSON - succès de l'ajout          |
| getArticle        | Query    | Récupère le contenu d'un article et ses commentaires.                       | JSON - détail d'un article        |
| addComment        | Mutation | Ajoute un commentaire à un article                                          | JSON - succès de l'ajout          |

\* *Query = lecture sans effet de bord ; Mutation = opération modifiant l'état (écriture en base, ouverture de session,
etc.).*

† *`login` / `logout` enrobent les helpers d'Auth.js (NextAuth) appelés depuis une Server Action ; le point d'entrée
HTTP
de l'authentification reste le Route Handler `/api/auth/[...nextauth]` décrit au §2.1.*

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
`USER` et `TOPIC` (cf. `NOTES.md` pour la justification de ce choix).

---

<a id="tests-qualite"></a>

## 3. Tests, performance et qualité

<a id="strategie-test"></a>

### 3.1 Stratégie de test

Décrivez les tests mis en place :

* **unitaires** (Vitest/Jest), **d'intégration**, **end-to-end** (Playwright/Cypress),
* frameworks utilisés,
* taux de couverture.

| Type de test       | Outil / framework     | Portée                     | Résultats |
|:-------------------|:----------------------|:---------------------------|:----------|
| Test unitaire      | Vitest                | Server Actions / Utils     |           |
| Test d'intégration | React Testing Library | Composants Client / Server |           |
| Test e2e           | Playwright            | Parcours critiques         |           |

<a id="performance"></a>

### 3.2 Rapport de performance et optimisation

Décrivez les actions menées pour **améliorer la performance** du code et du rendu :

* résultats d'audit (Lighthouse, Vercel Analytics, etc.),
* points d'amélioration identifiés,
* actions correctives appliquées.

*Exemple : "Après audit Lighthouse, la performance est passée de 65 à 95/100 grâce à l'utilisation du composant
Next/Image et au rendu statique partiel (PPR)."*

<a id="revue-technique"></a>

### 3.3 Revue technique

Présentez une **synthèse critique du code** :

* points forts (structure, typage TypeScript, sécurité Zod),
* points à améliorer (complexité, dette technique),
* actions correctives appliquées.

*Exemple :*

* **Point fort :** Typage strict de bout en bout avec Prisma et TypeScript.
* **À améliorer :** Duplication de la logique de validation dans plusieurs Server Actions.
* **Action corrective :** Centralisation des schémas Zod dans un dossier lib/definitions.

---

<a id="documentation-utilisateur"></a>

## 4. Documentation utilisateur et supervision

<a id="faq"></a>

### 4.1 FAQ utilisateur

Rédigez une courte section d'aide destinée aux utilisateurs internes ou finaux. Structurez-la en format **Question /
Réponse**.

Q : Comment créer un compte ?

R : Cliquez sur "S'inscrire", remplissez le formulaire et validez. Vous serez automatiquement connecté.

Q : Que faire si l'application ne charge pas ?

R : Rafraîchissez la page. Si le problème persiste, vérifiez votre connexion ou contactez le support technique.

<a id="supervision-ia"></a>

### 4.2 Supervision et tâches déléguées à l'IA

Décrivez les tâches confiées à l'IA ou à des collaborateurs juniors, et comment vous avez **revérifié, validé ou corrigé
** leur travail.

| Tâche déléguée                                                                                    | Outil / collaborateur | Objectif                                                                           | Vérification effectuée                                                                                          |
|:--------------------------------------------------------------------------------------------------|:----------------------|:-----------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|
| Mise en place de la documentation (sommaire cliquable, ancres PDF-compatibles, fichiers de suivi) | Claude                | Documentation navigable et traçabilité du projet                                   | Ouverture de `DOCUMENTATION.md` sur GitHub, test de chaque lien du sommaire et relecture du contenu généré      |
| Revue critique du tableau des choix techniques (complétude, justifications, ordre, coquilles)     | Claude                | Crédibiliser la section « Choix techniques »                                       | Validation point par point des remarques, arbitrage des reformulations conservées et relecture du tableau final |
| Génération des diagrammes ERD et d'archtecture                                                    | Claude                | Réalisation de diagrammes compatibles avec mon IDE et Github dans la documentation | Validation de la suggestion du format mermaid, vérification de la cohérence et lisibilité des diagrammes        |

---

<a id="annexes"></a>

## 5. Annexes

Intégrez ici toutes les pièces justificatives :

* **Captures d'écran de l'UI** et vues principales.
* **Analyse des besoins front-end** (liens avec les spécifications ou maquettes).
* **Définition des données** (schémas Prisma, types TypeScript, règles Zod).
* **Rapports de couverture et de tests** (exports ou impressions d'écran).
* **Rapport de revue technique** (version complète, datée et signée si applicable).
