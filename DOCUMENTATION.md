Auteur : **Vincent VANWAELSCAPPEL**
Version : **0.0.2**
Date : **10/06/2026**

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

| Fonctionnalités                      | Description                                         | Statut |
|:-------------------------------------|:----------------------------------------------------|:-------|
| **Création d'un compte utilisateur** | Formulaire et validation d'inscription (Zod)        |        |
| **Publication d'un article**         | Gestion CRUD via Server Actions                     |        |
| **Commentaires**                     | Association article/commentaires (Prisma Relations) |        |
| **Authentification**                 | Sécurisation (Auth.js / NextAuth)                   |        |

---

<a id="architecture"></a>

## 2. Architecture et conception technique

<a id="schema-architecture"></a>

### 2.1 Schéma global de l'architecture

Intégrez un diagramme d'architecture (UML, C4 ou équivalent) illustrant les liens entre :

* les Client Components (Front-end),
* les Server Actions (Logique métier / API),
* la base de données (Prisma ORM),
* les outils externes ou services tiers.

Ajoutez une légende explicative et précisez les **choix d'organisation technique** (modules, dossiers /app, conventions
internes).

<a id="choix-techniques"></a>

### 2.2 Choix techniques

| Éléments choisis   | Type                             | Lien documentation                                                                 | Objectif du choix                         | Justification                                                                                   |
|:-------------------|:---------------------------------|:-----------------------------------------------------------------------------------|:------------------------------------------|:------------------------------------------------------------------------------------------------|
| **Typescript**     | Langage                          | https://www.typescriptlang.org/docs/                                               | Langage au typage strict                  | Détecter les erreurs avant l'exécution                                                          |
| **Next.js, React** | Framework Full-stack             | https://nextjs.org/docs<br/>https://react.dev/learn                                | Architecture unifiée et Server Components | Performance, simplification de la stack (pas d'API REST séparée)                                |
| **PostgreSQL**     | Moteur de Base de données        | https://www.postgresql.org/docs/                                                   | Persistance des données                   | Performances, support des transactions                                                          |
| **Prisma**         | Object-relational mappings (ORM) | https://www.prisma.io/docs<br/>https://www.prisma.io/docs/guides/frameworks/nextjs | Couche d'abstraction des données          | Abstraction des requêtes, agnostique au moteur de BDD sous-jacent, typage et migrations générés |
| **Zod**            | Validation                       | https://zod.dev/                                                                   | Validation des données                    | Simplicité et lisibilité de la syntaxe, une source de vérité (cf. z.infer)                      |
| **NextAuth.js**    | Bibliothèque d'authentification  | https://next-auth.js.org/getting-started/introduction                              | Sécurisation de l'application             | Support d'un vaste choix de méthodes d'authentification (future proof)                          |
| **Tailwind**       | Framework CSS                    | https://tailwindcss.com/docs                                                       | Styliser rapidement                       | Gestion du responsive, styles et composants regroupés via classes utilitaires                   |
| **shadcn/ui**      | Composants graphiques            | https://ui.shadcn.com/docs/                                                        | Composants graphiques prêts à l'emploi    | Visuellement compatible avec les maquettes du projet, design moderne, personnalisation étendue  |
| **GitHub**         | Collaboration                    | https://www.github.com                                                             | Versionning du code, collaboration, CI    | Gratuit, standard de l'industrie                                                                |

<a id="api-donnees"></a>

### 2.3 API et schémas de données

Présentez ici la **conception et la structuration de votre logique serveur** (Server Actions ou Route Handlers) :

* Server Actions créées,
* Types d'opérations (Query/Mutation),
* exemples d'objets retournés,
* schémas de données Prisma (modèles, relations, contraintes).

| Server Action / Endpoint | Type     | Description                    | Retour / Réponse          |
|:-------------------------|:---------|:-------------------------------|:--------------------------|
| getArticles              | Query    | Récupère la liste des articles | JSON – liste d'articles   |
| getUserProfile           | Query    | Détail d'un utilisateur        | JSON – profil utilisateur |
| signIn                   | Mutation | Authentifie un utilisateur     | Session / Cookie          |

Ajoutez une représentation visuelle des relations (Schéma Prisma / Diagramme ERD).

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

| Tâche déléguée                                                                                    | Outil / collaborateur | Objectif                                          | Vérification effectuée                                                                                              |
|:--------------------------------------------------------------------------------------------------|:----------------------|:--------------------------------------------------|:------------------------------------------------------------------------------------------------------------------|
| Mise en place de la documentation (sommaire cliquable, ancres PDF-compatibles, fichiers de suivi) | Claude                | Documentation navigable et traçabilité du projet  | Ouverture de `DOCUMENTATION.md` sur GitHub, test de chaque lien du sommaire et relecture du contenu généré         |
| Revue critique du tableau des choix techniques (complétude, justifications, ordre, coquilles)      | Claude                | Crédibiliser la section « Choix techniques »       | Validation point par point des remarques, arbitrage des reformulations conservées et relecture du tableau final    |

---

<a id="annexes"></a>

## 5. Annexes

Intégrez ici toutes les pièces justificatives :

* **Captures d'écran de l'UI** et vues principales.
* **Analyse des besoins front-end** (liens avec les spécifications ou maquettes).
* **Définition des données** (schémas Prisma, types TypeScript, règles Zod).
* **Rapports de couverture et de tests** (exports ou impressions d'écran).
* **Rapport de revue technique** (version complète, datée et signée si applicable).
