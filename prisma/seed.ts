import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

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

// Utilisateurs de démonstration. Usernames inspirés de l'alphabet phonétique
// OTAN. Tous partagent le même mot de passe de dev (voir DEMO_PASSWORD), qui
// respecte la politique du brief afin de permettre une vraie connexion.
const users = [
    {username: "charlie_codes", email: "charlie@mdd.dev"},
    {username: "juliette_dev", email: "juliette@mdd.dev"},
    {username: "mike_thedev", email: "mike@mdd.dev"},
    {username: "oscar_builds", email: "oscar@mdd.dev"},
    {username: "romeo_scripts", email: "romeo@mdd.dev"},
    {username: "victor_ships", email: "victor@mdd.dev"},
];

const DEMO_PASSWORD = "Password1!";

// Articles de démonstration (3 paragraphes chacun). `topic`
// L'auteur est attribué plus bas.
const articles: { topic: string; title: string; content: string }[] = [
    // --- JavaScript ---
    {
        topic: "JavaScript",
        title: "Comprendre l'asynchrone en JavaScript",
        content: `JavaScript est mono-thread : il ne fait qu'une chose à la fois. C'est précisément pour ça que l'asynchrone existe. Plutôt que de bloquer tout le programme en attendant une réponse réseau ou une lecture de fichier, le langage délègue la tâche et continue à dérouler le reste du code.

Pendant longtemps, on a jonglé avec des callbacks imbriqués, jusqu'à tomber dans le fameux « callback hell ». Les Promises ont apporté un modèle plus lisible, puis async/await a rendu le code asynchrone presque aussi simple à lire qu'un enchaînement synchrone.

Le piège classique reste de croire qu'async/await rend le code parallèle : il ne fait que le séquencer proprement. Si vous voulez lancer plusieurs opérations de front, c'est Promise.all qu'il vous faut, pas une succession d'await.`,
    },
    {
        topic: "JavaScript",
        title: "var, let, const : ce qui change vraiment",
        content: `Si vous écrivez encore var par habitude, il est temps de tourner la page. var a une portée de fonction et remonte en haut du scope (le hoisting), ce qui produit des comportements surprenants quand on s'y attend le moins.

let et const, eux, ont une portée de bloc : ils n'existent qu'entre les accolades où on les déclare. C'est plus prévisible, et ça évite quantité de bugs liés à des variables qui « fuient » hors de leur contexte.

La règle simple que j'applique : const par défaut, let seulement quand la valeur doit changer, et var jamais. Ça force à réfléchir à la mutabilité de chaque variable, et le code y gagne en clarté.`,
    },
    {
        topic: "JavaScript",
        title: "Le DOM n'est pas votre ennemi",
        content: `Avec l'omniprésence des frameworks, beaucoup de développeurs n'ont jamais vraiment manipulé le DOM à la main. C'est dommage, car comprendre comment le navigateur représente une page reste fondamental pour déboguer et optimiser.

Le DOM est un arbre d'objets que l'on peut parcourir, modifier, écouter. Les API modernes comme querySelector, classList ou les événements délégués couvrent l'immense majorité des besoins sans aucune bibliothèque.

Le vrai point de vigilance, c'est la performance : chaque modification du DOM peut déclencher un recalcul de mise en page. Regrouper ses changements et éviter les manipulations dans des boucles serrées fait souvent plus pour la fluidité qu'un framework de plus.`,
    },

    // --- TypeScript ---
    {
        topic: "TypeScript",
        title: "Pourquoi adopter TypeScript sur un projet existant",
        content: `Migrer un projet JavaScript vers TypeScript ne se fait pas du jour au lendemain, et c'est une bonne nouvelle : on peut y aller fichier par fichier. Le compilateur accepte un mélange des deux, ce qui rend la transition progressive et sans grand soir risqué.

Le bénéfice se sent dès les premiers types posés : l'éditeur devient un copilote qui autocomplète, signale les fautes de frappe et documente les signatures. Beaucoup de bugs qui passaient en production sont désormais attrapés avant même de lancer le code.

Le coût, c'est la rigueur. Au début, on râle contre le compilateur qui refuse de se taire. Mais cette friction, c'est exactement le travail qu'on ne fera plus à la main en relisant ou en débuggant trois semaines plus tard.`,
    },
    {
        topic: "TypeScript",
        title: "Les types utilitaires que j'utilise tous les jours",
        content: `TypeScript fournit une boîte à outils de types prêts à l'emploi qu'on aurait tort d'ignorer. Partial rend toutes les propriétés optionnelles, Required fait l'inverse, et Pick ou Omit permettent de dériver un type d'un autre sans dupliquer les définitions.

Record est sans doute mon préféré pour typer des dictionnaires : Record<string, User> exprime clairement « un objet dont les valeurs sont des User ». C'est plus parlant qu'une signature d'index écrite à la main.

L'intérêt de ces utilitaires, ce n'est pas seulement d'écrire moins. C'est de garder une seule source de vérité : quand le type de base change, tout ce qui en dérive se met à jour automatiquement, sans risque d'oubli.`,
    },
    {
        topic: "TypeScript",
        title: "any est une dette, pas une solution",
        content: `Quand le compilateur bloque, la tentation est grande d'écrire any et de passer à autre chose. Le problème, c'est qu'any désactive purement et simplement le typage : la variable redevient du JavaScript brut, et toute la chaîne qui en dépend perd ses garanties.

Dans la plupart des cas, ce qu'on cherche c'est unknown. Il dit « je ne connais pas encore le type », mais force à le vérifier avant utilisation. La sécurité est préservée, seule la responsabilité du contrôle est déplacée là où elle doit être.

Si vous devez vraiment utiliser any, faites-le consciemment et localement, avec un commentaire qui explique pourquoi. Un any isolé et documenté est gérable ; un any qui se propage de fonction en fonction finit par contaminer toute la base de code.`,
    },

    // --- Python ---
    {
        topic: "Python",
        title: "Python pour automatiser ses tâches répétitives",
        content: `Avant d'être un langage de data science ou de back-end, Python est un formidable outil pour automatiser le quotidien. Renommer des centaines de fichiers, nettoyer un export, envoyer un rapport : autant de corvées qu'un petit script règle en quelques lignes.

Sa bibliothèque standard couvre déjà énormément de besoins : manipulation de fichiers, requêtes système, parsing de CSV ou de JSON. On peut aller très loin sans installer la moindre dépendance externe.

Le déclic, c'est de réaliser que le temps passé à écrire le script est vite rentabilisé. Une tâche de cinq minutes faite chaque jour, c'est plus de vingt heures par an : largement de quoi justifier une après-midi d'automatisation.`,
    },
    {
        topic: "Python",
        title: "Environnements virtuels : arrêtez de polluer votre système",
        content: `Installer des paquets directement sur le Python du système est une erreur de débutant qu'on paie tôt ou tard. Deux projets qui ont besoin de versions différentes d'une même bibliothèque, et c'est le conflit assuré.

Les environnements virtuels résolvent ça en isolant les dépendances projet par projet. Un venv par dossier, et chacun vit dans sa bulle, avec ses propres versions, sans jamais marcher sur les pieds des autres.

Couplés à un fichier de dépendances versionné, ils rendent aussi le projet reproductible : n'importe qui peut recréer exactement le même environnement. C'est la base d'un travail d'équipe sain et d'un déploiement sans surprise.`,
    },
    {
        topic: "Python",
        title: "Les compréhensions de liste, avec modération",
        content: `Les compréhensions de liste font partie de l'élégance de Python. Écrire [x * 2 for x in nombres if x > 0] sur une ligne est à la fois concis et lisible, là où d'autres langages demandent une boucle complète.

Mais comme tout outil puissant, elles s'utilisent avec discernement. Une compréhension imbriquée sur trois niveaux avec deux conditions n'est plus lisible du tout : à ce stade, une bonne vieille boucle explicite rend service à tout le monde.

Le bon critère, c'est la lisibilité à voix haute. Si vous pouvez lire la compréhension d'une traite et la comprendre, gardez-la. Sinon, déroulez-la. Le code se lit bien plus souvent qu'il ne s'écrit.`,
    },

    // --- Java ---
    {
        topic: "Java",
        title: "Java en 2026 : toujours pertinent ?",
        content: `On enterre Java régulièrement depuis vingt ans, et il est toujours là, tournant sur des milliards d'appareils et au cœur d'innombrables systèmes d'entreprise. Sa longévité tient à une compatibilité ascendante exemplaire et à un écosystème d'une rare maturité.

Le langage a beaucoup évolué : records, switch expressions, pattern matching, et un rythme de versions désormais soutenu. Le Java d'aujourd'hui est nettement plus concis et agréable que celui dont on garde parfois un souvenir poussiéreux.

Pertinent, donc, oui, surtout là où la fiabilité et l'outillage priment sur la mode. Pour un système qui doit tourner dix ans sans surprise, Java reste un choix défendable, et même rassurant.`,
    },
    {
        topic: "Java",
        title: "Comprendre la JVM sans avoir peur",
        content: `La machine virtuelle Java intimide souvent, alors que son principe est simple : votre code est compilé en bytecode, un langage intermédiaire que la JVM exécute. C'est ce qui permet le fameux « écrire une fois, exécuter partout ».

Là où ça devient intéressant, c'est que la JVM optimise à l'exécution. Le compilateur à la volée repère le code chaud, celui qui tourne souvent, et le traduit en instructions natives ultra-rapides. Un programme Java peut ainsi accélérer après quelques secondes de fonctionnement.

Comprendre ces mécanismes, ne serait-ce qu'en surface, change la façon de déboguer les problèmes de performance ou de mémoire. Le ramasse-miettes, en particulier, cesse d'être une boîte noire dès qu'on saisit comment il raisonne.`,
    },
    {
        topic: "Java",
        title: "Streams et lambdas : du Java qui respire",
        content: `Pendant longtemps, parcourir une collection en Java demandait des boucles verbeuses. Les lambdas et l'API Stream ont changé la donne en permettant d'exprimer le quoi plutôt que le comment.

Filtrer, transformer, regrouper, agréger : ces opérations s'enchaînent en une déclaration fluide qui se lit presque comme une phrase. Le code décrit l'intention, et les détails d'itération disparaissent.

Attention toutefois à ne pas en abuser. Un stream de quinze opérations chaînées sur plusieurs lignes peut devenir aussi obscur qu'une boucle mal écrite. La clarté reste le juge de paix, pas le nombre de lignes économisées.`,
    },

    // --- C# ---
    {
        topic: "C#",
        title: "Découvrir .NET pour un dév venu d'ailleurs",
        content: `Si vous venez de Java ou de TypeScript, C# vous paraîtra étonnamment familier. La syntaxe objet, le typage statique et l'organisation en namespaces reprennent des concepts que vous maîtrisez déjà, ce qui rend la prise en main rapide.

La plateforme .NET, désormais unifiée et open source, tourne sur Windows, Linux et macOS. Fini le temps où C# rimait avec écosystème fermé : on déploie aujourd'hui des services .NET dans des conteneurs Linux sans le moindre état d'âme.

Ce qui séduit vite, c'est la cohérence de l'outillage. Entre l'éditeur, le gestionnaire de paquets et le framework web, tout s'imbrique proprement. On passe moins de temps à configurer et plus à construire.`,
    },
    {
        topic: "C#",
        title: "async/await en C# : les bases solides",
        content: `C# a popularisé le modèle async/await bien avant que d'autres langages ne l'adoptent. L'idée reste la même : libérer le thread pendant une opération longue plutôt que de le laisser attendre bêtement.

Le mot-clé Task est au cœur du dispositif : il représente une opération en cours dont on récupérera le résultat plus tard. await suspend la méthode jusqu'à ce que la tâche soit terminée, sans bloquer le fil d'exécution.

Le piège récurrent, c'est le mélange de code synchrone et asynchrone. Appeler .Result sur une tâche depuis un contexte synchrone peut figer toute l'application. La règle d'or : async de bout en bout, sans rupture dans la chaîne.`,
    },
    {
        topic: "C#",
        title: "LINQ, ou comment écrire moins pour faire plus",
        content: `LINQ est sans doute la fonctionnalité la plus distinctive de C#. Interroger une liste en mémoire, une base de données ou un document XML avec la même syntaxe déclarative, c'est un confort dont on a du mal à se passer une fois adopté.

Where, Select, GroupBy, OrderBy : ces opérateurs s'enchaînent pour exprimer des requêtes complexes de façon lisible. Le code dit ce qu'il veut obtenir, pas comment itérer pour l'obtenir.

La subtilité à connaître, c'est l'exécution différée. Une requête LINQ ne s'exécute pas tant qu'on ne parcourt pas son résultat. C'est puissant pour composer, mais source de surprises si l'on ignore quand le calcul a réellement lieu.`,
    },

    // --- C++ ---
    {
        topic: "C++",
        title: "C++ moderne : oubliez ce qu'on vous a appris",
        content: `Le C++ qu'on enseignait il y a quinze ans n'a plus grand-chose à voir avec celui qu'on écrit aujourd'hui. Les versions récentes du standard ont profondément modernisé le langage, au point de changer les habitudes les plus ancrées.

Les pointeurs intelligents remplacent avantageusement les new et delete manuels, réduisant drastiquement les fuites de mémoire. L'inférence de type avec auto allège la syntaxe, et la sémantique de déplacement évite des copies coûteuses.

Le résultat, c'est un langage qui reste proche du métal tout en étant bien plus sûr et expressif. Si votre image du C++ date de vos études, il est sans doute temps de la rafraîchir.`,
    },
    {
        topic: "C++",
        title: "La gestion mémoire expliquée simplement",
        content: `Ce qui effraie le plus en C++, c'est la gestion manuelle de la mémoire. Pourtant, le principe est limpide : ce que vous allouez, vous devez le libérer, et chaque ressource a un propriétaire clairement identifié.

Le paradigme RAII formalise cette idée : une ressource est acquise dans le constructeur d'un objet et libérée dans son destructeur. Quand l'objet sort de portée, le nettoyage se fait automatiquement, sans intervention.

Maîtriser ce modèle, c'est comprendre pourquoi le C++ offre à la fois performance et contrôle. On ne paie que ce qu'on utilise, et rien ne se passe dans le dos du développeur. Cette transparence a un coût d'apprentissage, mais elle se mérite.`,
    },
    {
        topic: "C++",
        title: "Quand (ne pas) choisir le C++",
        content: `Le C++ brille là où la performance et le contrôle fin du matériel sont non négociables : moteurs de jeux, systèmes embarqués, calcul intensif, traitement temps réel. Dans ces domaines, peu de langages rivalisent.

Mais sa puissance a un prix : une complexité considérable et un temps de développement souvent plus long. Pour un service web classique ou un outil interne, ce choix relève parfois plus de l'affect que de la raison.

Le bon réflexe, c'est de se demander si l'on a vraiment besoin de ce que le C++ offre. Si la réponse est non, un langage plus haut niveau livrera le même résultat plus vite et avec moins de bugs. Choisir le bon outil, c'est aussi savoir renoncer au plus prestigieux.`,
    },

    // --- Go ---
    {
        topic: "Go",
        title: "Go : la simplicité comme fonctionnalité",
        content: `Go assume un parti pris rare : faire moins, mais bien. Pas d'héritage, pas de génériques pendant longtemps, une syntaxe volontairement minimale. Là où d'autres langages multiplient les façons de faire, Go en impose souvent une seule.

Cette austérité déroute au début, surtout venant d'un langage riche. Puis on réalise qu'elle a un immense avantage : tout le code Go se ressemble. Reprendre le projet d'un collègue ne demande pas de déchiffrer son style personnel.

Le formatage automatique pousse cette logique jusqu'au bout : il n'y a même plus de débat sur l'indentation. On code, on sauvegarde, c'est mis en forme. Le temps libéré par ces non-décisions est du temps rendu au vrai travail.`,
    },
    {
        topic: "Go",
        title: "Les goroutines, la concurrence sans douleur",
        content: `La concurrence est réputée difficile, et elle l'est dans la plupart des langages. Go a fait le pari de la rendre accessible avec les goroutines : lancer une fonction en parallèle se résume à écrire le mot-clé go devant son appel.

Les goroutines sont extrêmement légères, on peut en lancer des milliers sans saturer la machine. Pour les faire communiquer, Go propose les channels, qui transmettent des données d'une goroutine à l'autre de façon sûre.

La philosophie tient en une phrase souvent citée : ne communiquez pas en partageant la mémoire, partagez la mémoire en communiquant. Adopter ce modèle évite une grande part des bugs de concurrence qui hantent les approches classiques.`,
    },
    {
        topic: "Go",
        title: "Pourquoi Go est partout dans le cloud",
        content: `Si vous regardez sous le capot des outils d'infrastructure modernes, vous trouverez du Go presque partout. Ce n'est pas un hasard : le langage a été pensé pour ce type d'usage par des ingénieurs qui en avaient assez des compilations lentes.

Un binaire Go est compilé statiquement, sans dépendance externe. On obtient un seul fichier qu'on dépose et qu'on exécute, ce qui simplifie énormément le déploiement, en particulier dans des conteneurs minimalistes.

Ajoutez à cela des temps de compilation quasi instantanés, une empreinte mémoire raisonnable et une concurrence native, et vous comprenez pourquoi Go est devenu la lingua franca des services cloud et des outils d'orchestration.`,
    },

    // --- Rust ---
    {
        topic: "Rust",
        title: "Le borrow checker n'est pas là pour vous embêter",
        content: `Tout nouveau venu en Rust passe par la même épreuve : le borrow checker qui refuse de compiler son code. La frustration est réelle, mais elle cache un cadeau qu'on n'apprécie qu'après coup.

Ce mécanisme garantit, à la compilation, qu'aucune référence ne pointe vers de la mémoire libérée et qu'aucune donnée n'est modifiée par deux endroits à la fois. Toute une catégorie de bugs, parmi les plus pernicieux, devient tout simplement impossible.

Le combat contre le compilateur n'est pas une corvée gratuite : c'est le travail de débogage qu'on fait d'avance, une bonne fois pour toutes. Passé l'apprentissage, on écrit du code concurrent avec une sérénité qu'aucun langage à ramasse-miettes ne procure.`,
    },
    {
        topic: "Rust",
        title: "Rust pour qui, pour quoi ?",
        content: `Rust n'est pas un langage à adopter par effet de mode. Il vise un créneau précis : la performance d'un langage système avec des garanties de sûreté que le C et le C++ n'offrent pas nativement.

C'est un choix pertinent pour des composants critiques où une fuite de mémoire ou une erreur de concurrence coûte cher : moteurs, systèmes embarqués, services à fort trafic, outils en ligne de commande performants. Là, l'investissement initial se rentabilise.

En revanche, pour un prototype rapide ou une application métier sans contrainte de performance, la rigueur de Rust peut ralentir inutilement. Comme toujours, le meilleur langage est celui qui correspond au problème, pas celui qui impressionne le plus.`,
    },
    {
        topic: "Rust",
        title: "Migrer un service critique vers Rust",
        content: `Réécrire un service entier d'un coup est rarement une bonne idée, et Rust ne fait pas exception. La stratégie qui marche, c'est d'identifier le composant le plus sensible aux performances ou à la fiabilité, et de le réécrire isolément.

L'interopérabilité aide : Rust s'interface proprement avec d'autres langages, ce qui permet de remplacer une brique sans toucher au reste. On valide le gain sur un périmètre maîtrisé avant d'envisager d'aller plus loin.

Le retour d'expérience le plus fréquent, c'est la baisse spectaculaire des incidents en production après migration. Moins de plantages liés à la mémoire, moins de comportements aléatoires sous charge. Le coût d'apprentissage se paie une fois ; la tranquillité, elle, dure.`,
    },

    // --- PHP ---
    {
        topic: "PHP",
        title: "PHP moderne : le grand malentendu",
        content: `PHP traîne une réputation héritée de ses débuts : langage brouillon, code spaghetti, failles à tous les étages. Cette image colle à la peau, alors qu'elle décrit un PHP qui n'existe plus vraiment.

Les versions récentes ont apporté un typage solide, des attributs, des énumérations et des performances multipliées. Le PHP d'aujourd'hui, écrit avec un framework moderne, n'a plus rien du bricolage des années 2000.

Le malentendu vient surtout de la facilité d'entrée du langage : il est si accessible qu'on trouve beaucoup de mauvais code écrit par des débutants. Mais juger PHP sur ces exemples, c'est juger un outil sur ceux qui l'utilisent mal.`,
    },
    {
        topic: "PHP",
        title: "Composer a changé la vie des dévs PHP",
        content: `Avant Composer, gérer les dépendances en PHP relevait du bricolage : téléchargements manuels, inclusion de fichiers à la main, conflits de versions ingérables. L'arrivée du gestionnaire de paquets a transformé l'écosystème en profondeur.

Déclarer ses dépendances dans un fichier, lancer une commande, et tout s'installe avec le chargement automatique configuré : ce qui semble banal aujourd'hui a véritablement professionnalisé le développement PHP.

Au-delà de l'outil, Composer a fédéré une communauté autour de paquets réutilisables et de standards partagés. C'est en grande partie ce qui a permis l'essor des frameworks modernes et la renaissance d'un langage qu'on disait condamné.`,
    },
    {
        topic: "PHP",
        title: "Symfony ou Laravel : choisir sans se tromper",
        content: `Le débat Symfony contre Laravel anime les communautés PHP depuis des années, souvent avec plus de passion que de raison. La vérité, c'est qu'il n'y a pas de mauvais choix, seulement des contextes différents.

Symfony mise sur la rigueur, la modularité et la configuration explicite. Il brille sur les projets d'envergure, durables, où la maîtrise fine de l'architecture compte. Sa courbe d'apprentissage est plus raide, mais l'investissement paie sur le long terme.

Laravel privilégie la productivité immédiate et une expérience développeur soignée. On démarre vite, on livre vite, ce qui en fait un excellent choix pour des applications métier et des équipes qui veulent avancer sans cérémonie. Le bon framework dépend de votre projet, pas du camp qu'on vous somme de rejoindre.`,
    },

    // --- Ruby ---
    {
        topic: "Ruby",
        title: "Ruby, le langage du bonheur du développeur",
        content: `Ruby a été conçu autour d'une idée peu commune : optimiser le bonheur du développeur plutôt que la performance de la machine. Cela transparaît dans une syntaxe d'une rare élégance, où le code se lit presque comme de l'anglais.

Cette philosophie a des conséquences concrètes. Écrire en Ruby est souvent un plaisir, et le langage encourage un style expressif où l'intention prime sur la mécanique. Beaucoup de développeurs gardent une affection particulière pour lui.

Le revers, c'est que cette expressivité peut masquer ce qui se passe réellement. La lisibilité est reine, mais elle demande une certaine maturité pour ne pas verser dans le code trop malin, agréable à écrire et pénible à maintenir.`,
    },
    {
        topic: "Ruby",
        title: "Rails est-il toujours d'actualité ?",
        content: `Ruby on Rails a façonné le développement web moderne : convention plutôt que configuration, génération de code, productivité fulgurante. Beaucoup de ce qu'on tient pour acquis aujourd'hui vient de là.

On a annoncé son déclin maintes fois, pourtant Rails continue de propulser des produits à très grande échelle. Pour une équipe qui veut transformer une idée en application fonctionnelle rapidement, peu de frameworks restent aussi efficaces.

Sa pertinence dépend du contexte. Sur un produit où la vitesse de livraison prime et où l'équipe reste resserrée, Rails est redoutable. Sur des architectures très spécialisées, d'autres approches le supplantent. Mais l'enterrer serait, encore une fois, prématuré.`,
    },
    {
        topic: "Ruby",
        title: "La magie de Ruby, à double tranchant",
        content: `Ruby est célèbre pour sa « magie » : cette capacité à faire beaucoup avec peu, grâce à la métaprogrammation et à des frameworks qui devinent vos intentions. Au début, c'est enthousiasmant, presque déroutant tant ça semble fonctionner tout seul.

Le problème surgit quand il faut comprendre pourquoi quelque chose ne marche pas. Le code qui s'exécute n'est pas toujours celui qu'on voit écrit : des méthodes sont générées dynamiquement, des comportements injectés en coulisses. Le débogage devient un jeu de piste.

La leçon, c'est d'utiliser la magie avec parcimonie. Dans son propre code, mieux vaut privilégier l'explicite. Garder la métaprogrammation pour les cas où elle apporte une vraie valeur, et résister à la tentation de l'astuce pour l'astuce.`,
    },

    // --- Swift ---
    {
        topic: "Swift",
        title: "Premiers pas en Swift pour iOS",
        content: `Swift a été pensé pour être accessible aux débutants tout en restant puissant pour les experts. Sa syntaxe claire et son typage sûr en font une excellente porte d'entrée vers le développement d'applications Apple.

Le langage hérite des leçons de ses prédécesseurs : il est plus sûr et plus concis qu'Objective-C, tout en restant performant. Les concepts modernes comme l'inférence de type ou la gestion stricte des valeurs nulles y sont natifs.

Pour démarrer, l'environnement d'Apple offre un terrain de jeu interactif où tester du code et voir le résultat en direct. C'est un excellent moyen d'apprivoiser le langage avant de se lancer dans une vraie application.`,
    },
    {
        topic: "Swift",
        title: "SwiftUI vs UIKit : le match",
        content: `Apple propose désormais deux façons de construire des interfaces : UIKit, l'éprouvé, et SwiftUI, le moderne. Le choix entre les deux structure durablement un projet, il mérite réflexion.

SwiftUI adopte une approche déclarative : on décrit à quoi l'interface doit ressembler selon l'état, et le framework se charge des mises à jour. Le code est plus court, plus lisible, et les aperçus en temps réel accélèrent le développement.

UIKit, plus ancien, reste incontournable pour les besoins pointus et la prise en charge des anciennes versions du système. Beaucoup d'équipes combinent les deux, en démarrant le neuf en SwiftUI tout en conservant l'existant en UIKit. La transition se fait progressivement, sans rupture.`,
    },
    {
        topic: "Swift",
        title: "Optionals : la sécurité avant tout",
        content: `Les optionals sont au cœur de la philosophie de sûreté de Swift. Une valeur est soit présente, soit explicitement absente, et le langage vous force à traiter ce second cas. Fini les plantages mystérieux dus à une valeur nulle inattendue.

Cette contrainte agace au début : on aimerait juste accéder à la valeur sans cérémonie. Mais le déballage sécurisé, avec if let ou guard, devient vite un réflexe qui rend le code intentionnel et robuste.

Le danger, c'est le déballage forcé avec le point d'exclamation, qui court-circuite toutes ces protections. À utiliser seulement quand on a la certitude absolue que la valeur existe. Dans le doute, on déballe proprement : c'est tout l'esprit de Swift.`,
    },

    // --- Kotlin ---
    {
        topic: "Kotlin",
        title: "Kotlin : pourquoi Android a basculé",
        content: `En quelques années, Kotlin est passé d'alternative confidentielle à langage officiellement recommandé pour Android. Ce basculement ne doit rien au hasard : il répond à des frustrations bien réelles des développeurs.

Kotlin élimine une grande partie de la verbosité de Java tout en restant totalement interopérable avec lui. On écrit moins, on lit mieux, et surtout on évite nativement certaines erreurs comme les références nulles, longtemps première cause de plantages sur mobile.

Le résultat, c'est un langage qui se sent moderne sans imposer de tout réapprendre. Pour les équipes Android, l'adoption a été d'autant plus naturelle qu'elle pouvait se faire progressivement, fichier après fichier.`,
    },
    {
        topic: "Kotlin",
        title: "Coroutines Kotlin, l'asynchrone élégant",
        content: `Gérer l'asynchrone sur mobile a longtemps été pénible, entre callbacks imbriqués et risques de bloquer l'interface. Les coroutines de Kotlin offrent une réponse particulièrement soignée à ce problème.

Elles permettent d'écrire du code asynchrone qui se lit de façon séquentielle, comme s'il était synchrone, tout en libérant le thread principal. L'interface reste fluide pendant qu'une opération longue s'exécute en arrière-plan.

Le modèle introduit aussi la notion de portée structurée : les coroutines sont liées à un cycle de vie et s'annulent proprement quand il se termine. Fini les tâches orphelines qui continuent de tourner après la fermeture d'un écran.`,
    },
    {
        topic: "Kotlin",
        title: "Du Java au Kotlin sans tout réécrire",
        content: `La grande force de Kotlin pour les projets existants, c'est son interopérabilité totale avec Java. Les deux langages cohabitent dans la même base de code, s'appellent mutuellement, et compilent vers le même bytecode.

Concrètement, on peut introduire Kotlin dans un projet Java mature sans big bang. On écrit les nouveaux fichiers en Kotlin, on convertit les anciens au fil de l'eau quand on y touche, et tout continue de fonctionner.

Cette approche progressive est ce qui a rendu l'adoption si massive. Pas besoin de convaincre une équipe de tout migrer d'un coup : il suffit de laisser chacun goûter au confort de Kotlin sur son prochain fichier. La conversion se fait souvent toute seule, par adhésion.`,
    },

    // --- SQL ---
    {
        topic: "SQL",
        title: "Les jointures enfin claires",
        content: `Les jointures sont la bête noire de bien des développeurs, alors que leur logique est géométrique et simple une fois visualisée. Une jointure relie deux tables sur une condition, et le type de jointure détermine ce qu'on garde quand la correspondance manque.

La jointure interne ne renvoie que les lignes qui matchent des deux côtés. La jointure externe gauche garde toutes les lignes de la table de gauche, complétant par des valeurs nulles à droite quand il n'y a pas de correspondance. Tout le reste découle de ces deux idées.

Le déclic vient souvent en dessinant les ensembles sur un papier. Une fois qu'on visualise quelles lignes survivent à quelle jointure, on cesse de tâtonner et on écrit la requête juste du premier coup.`,
    },
    {
        topic: "SQL",
        title: "Index : la différence entre 10 ms et 10 s",
        content: `Une requête qui tourne en quelques millisecondes sur votre machine peut s'effondrer en production quand la table grossit. Neuf fois sur dix, la cause est la même : un index manquant.

Un index, c'est l'équivalent de l'index d'un livre. Plutôt que de parcourir toute la table ligne par ligne, la base saute directement aux données pertinentes. Sur une colonne fréquemment filtrée, l'effet est spectaculaire.

Mais les index ne sont pas gratuits : ils consomment de l'espace et ralentissent les écritures, puisqu'il faut les maintenir à jour. L'art consiste à indexer ce qu'on interroge souvent, sans tomber dans l'excès inverse d'indexer tout et n'importe quoi.`,
    },
    {
        topic: "SQL",
        title: "Arrêtez d'avoir peur des requêtes complexes",
        content: `Beaucoup de développeurs rapatrient des données brutes pour les traiter ensuite dans leur langage applicatif, par crainte des requêtes SQL un peu poussées. C'est souvent un mauvais calcul, à la fois pour la performance et pour la lisibilité.

La base de données est conçue pour agréger, filtrer et trier efficacement. Une fonction de fenêtrage ou une expression de table commune bien placée remplace parfois des dizaines de lignes de code applicatif, en s'exécutant bien plus vite.

L'astuce pour apprivoiser ces requêtes, c'est de les construire par étapes : on commence simple, on vérifie le résultat, puis on ajoute une couche. Décomposée ainsi, une requête intimidante devient une suite de petits pas parfaitement maîtrisables.`,
    },

    // --- Intelligence artificielle ---
    {
        topic: "Intelligence artificielle",
        title: "Comprendre les LLM sans bac+8",
        content: `Les grands modèles de langage impressionnent, mais leur principe de base est plus simple qu'il n'y paraît. À chaque étape, le modèle prédit le mot le plus probable pour continuer un texte, en s'appuyant sur tout ce qu'il a vu pendant son entraînement.

Cette mécanique de prédiction, répétée mot après mot et entraînée sur d'immenses corpus, suffit à produire des réponses cohérentes, du code, des résumés. Il n'y a pas de compréhension au sens humain, mais une modélisation statistique remarquablement efficace du langage.

Garder cela en tête aide à utiliser ces outils intelligemment. Un modèle peut se tromper avec aplomb, car il optimise la plausibilité, pas la vérité. Le développeur reste responsable de vérifier ce qu'on lui sert, surtout quand ça paraît trop beau.`,
    },
    {
        topic: "Intelligence artificielle",
        title: "Intégrer une IA dans son app : par où commencer",
        content: `Ajouter une fonctionnalité d'IA à une application n'exige plus de monter sa propre infrastructure. Des API prêtes à l'emploi permettent d'envoyer une requête et de récupérer une réponse, comme pour n'importe quel service externe.

Le vrai travail n'est pas technique mais conceptuel : bien définir ce que l'IA doit faire, formuler des instructions claires et encadrer ses réponses. Un cas d'usage précis donne de bien meilleurs résultats qu'une promesse vague d'« assistant intelligent ».

Restent les questions sérieuses à anticiper : le coût par requête, la latence, la confidentialité des données envoyées et la gestion des réponses erronées. Une démo fonctionne toujours ; un produit fiable demande de traiter tous ces angles morts.`,
    },
    {
        topic: "Intelligence artificielle",
        title: "L'IA ne remplacera pas (encore) les développeurs",
        content: `Les outils d'assistance au code ont fait des bonds spectaculaires, au point d'inquiéter sur l'avenir du métier. La réalité observée sur le terrain est plus nuancée : ces outils excellent à accélérer, beaucoup moins à décider.

Générer une fonction, proposer un test, expliquer un bout de code obscur : sur ces tâches, le gain de temps est réel. Mais comprendre un besoin métier, arbitrer une architecture, peser des compromis à long terme reste profondément humain.

Le développeur qui tire son épingle du jeu, c'est celui qui apprend à déléguer le fastidieux pour se concentrer sur le jugement. L'outil amplifie la compétence, il ne la remplace pas. Un mauvais prompt sur une mauvaise idée produit juste du mauvais code plus vite.`,
    },

    // --- CI/CD ---
    {
        topic: "CI/CD",
        title: "Votre première pipeline CI en 30 minutes",
        content: `Mettre en place une intégration continue paraît intimidant, mais on peut démarrer très modestement. Une pipeline minimale se contente de récupérer le code, d'installer les dépendances et de lancer les tests à chaque envoi.

Ce premier pas, aussi simple soit-il, change déjà la donne. Chaque modification est vérifiée automatiquement, et l'on sait immédiatement si quelque chose casse, sans attendre qu'un collègue le découvre à ses dépens.

Une fois cette base en place, on enrichit progressivement : analyse statique, vérification du formatage, mesure de la couverture. L'important est de commencer petit et de faire grandir la pipeline avec les besoins, pas de viser la perfection d'emblée.`,
    },
    {
        topic: "CI/CD",
        title: "Déployer plusieurs fois par jour, sereinement",
        content: `Déployer fait peur quand c'est rare et manuel. Paradoxalement, la solution n'est pas de déployer moins, mais plus souvent. Plus les mises en production sont fréquentes, plus elles sont petites, et plus elles sont faciles à diagnostiquer en cas de souci.

Le déploiement continu automatise le passage du code validé à la production. Couplé à des tests solides, il transforme une opération stressante en non-événement : on fusionne, et la fonctionnalité arrive chez les utilisateurs sans cérémonie.

La clé de la sérénité, c'est la capacité à revenir en arrière vite. Un déploiement automatisé doit pouvoir être annulé tout aussi automatiquement. Avec ce filet, livrer dix fois par jour devient non seulement possible, mais confortable.`,
    },
    {
        topic: "CI/CD",
        title: "Les tests, ce filet de sécurité qu'on néglige",
        content: `Tout le monde s'accorde sur l'importance des tests, et pourtant ils sont souvent les premiers sacrifiés sous la pression des délais. C'est une économie en trompe-l'œil, payée au prix fort quelques semaines plus tard.

Un test n'est pas une formalité, c'est une assurance. Il fige un comportement attendu et alerte dès qu'une modification le casse. Sans lui, chaque refactoring devient un pari, et la peur de toucher au code finit par paralyser l'équipe.

Inutile de viser une couverture totale dès le départ. Mieux vaut tester d'abord ce qui est critique et ce qui change souvent. Quelques tests bien placés sur le cœur métier rapportent infiniment plus qu'une myriade de tests triviaux sur du code sans enjeu.`,
    },

    // --- DevOps ---
    {
        topic: "DevOps",
        title: "DevOps : une culture avant des outils",
        content: `On réduit trop souvent le DevOps à une boîte à outils : conteneurs, pipelines, orchestrateurs. C'est passer à côté de l'essentiel. Le DevOps est d'abord une culture, celle de rapprocher ceux qui développent et ceux qui exploitent.

Historiquement, ces deux mondes s'opposaient : les uns voulaient livrer vite, les autres garantir la stabilité. Le DevOps propose de partager la responsabilité de bout en bout, de la première ligne de code jusqu'au comportement en production.

Les outils ne sont que la traduction concrète de cet état d'esprit. Sans la culture qui va avec, automatiser ne fait que reproduire plus vite des cloisonnements existants. Le vrai changement est humain avant d'être technique.`,
    },
    {
        topic: "DevOps",
        title: "Docker pour les développeurs pressés",
        content: `La phrase « ça marche sur ma machine » a fait perdre un temps colossal à des générations de développeurs. Docker la rend obsolète en empaquetant l'application avec tout son environnement dans un conteneur reproductible.

Concrètement, on décrit l'environnement dans un fichier, on construit une image, et cette image tourne à l'identique partout : sur votre poste, chez un collègue, en production. Les écarts de configuration qui causaient tant de bugs disparaissent.

Pour démarrer, nul besoin de maîtriser l'orchestration à grande échelle. Conteneuriser une application et la lancer localement suffit déjà à transformer le quotidien. Le reste, on l'apprend quand le besoin se présente vraiment.`,
    },
    {
        topic: "DevOps",
        title: "L'infrastructure as code, pourquoi s'y mettre",
        content: `Configurer un serveur à la main, c'est rapide une fois, mais ingérable à l'échelle. Que se passe-t-il quand il faut recréer la même infrastructure, la documenter, ou comprendre qui a modifié quoi ? L'infrastructure as code répond à ces questions.

L'idée est de décrire son infrastructure dans des fichiers versionnés, au même titre que le code applicatif. On ne clique plus dans une interface, on déclare l'état souhaité, et un outil se charge de l'atteindre.

Les bénéfices sont immédiats : reproductibilité, traçabilité via l'historique, possibilité de revue avant application. Recréer un environnement complet devient une commande, et non plus une journée de configuration manuelle dont personne ne se souvient des détails.`,
    },

    // --- Cybersécurité ---
    {
        topic: "Cybersécurité",
        title: "Les failles web les plus courantes",
        content: `La majorité des failles exploitées ne relèvent pas d'attaques sophistiquées, mais d'erreurs classiques et bien connues. Les injections, où des données utilisateur sont interprétées comme du code, restent en tête depuis des années.

Viennent ensuite les failles d'authentification mal gérée, l'exposition de données sensibles, ou les contrôles d'accès défaillants qui laissent un utilisateur accéder à ce qui ne le regarde pas. Rien d'exotique, que des fondamentaux négligés.

La bonne nouvelle, c'est que se prémunir contre ces grands classiques couvre déjà l'essentiel du risque. Valider les entrées, ne jamais faire confiance au client, appliquer le moindre privilège : ces réflexes simples évitent l'immense majorité des incidents.`,
    },
    {
        topic: "Cybersécurité",
        title: "Gérer les secrets sans les commiter",
        content: `Un mot de passe ou une clé d'API qui se retrouve dans un dépôt de code est l'une des fuites les plus fréquentes, et l'une des plus évitables. Une fois poussé, un secret est considéré comme compromis, même si on l'efface ensuite : l'historique garde tout.

La règle de base est de sortir les secrets du code source. On les place dans des variables d'environnement ou un gestionnaire de secrets dédié, et on s'assure que les fichiers qui les contiennent sont bien exclus du suivi de version.

Au-delà du stockage, il faut penser rotation et accès. Un secret se change régulièrement et n'est connu que de ceux qui en ont besoin. La sécurité n'est pas un état figé, c'est une hygiène qu'on entretient.`,
    },
    {
        topic: "Cybersécurité",
        title: "Sécuriser une API, les bases incontournables",
        content: `Une API ouverte sur le monde est une cible permanente. La sécuriser commence par une authentification solide : savoir qui appelle, et refuser tout le reste. Sans cette première barrière, le reste ne sert à rien.

Vient ensuite l'autorisation, distincte de l'authentification : être identifié ne signifie pas avoir le droit de tout faire. Chaque endpoint doit vérifier que l'appelant a effectivement la permission d'accéder à la ressource demandée.

Enfin, on n'oublie pas les protections transverses : limitation du débit pour contrer les abus, validation stricte des entrées, et chiffrement des communications. Aucune de ces mesures n'est suffisante seule, mais ensemble elles forment une défense sérieuse.`,
    },

    // --- Web ---
    {
        topic: "Web",
        title: "Le web n'a jamais été aussi rapide (si on veut)",
        content: `Les navigateurs et les réseaux n'ont jamais été aussi performants, et pourtant beaucoup de sites restent lents. Le paradoxe s'explique simplement : on charge toujours plus de scripts, d'images et de dépendances, annulant les gains matériels.

La performance web n'est pas une option qu'on active à la fin, c'est une discipline qui se pense dès le départ. Charger uniquement ce qui est nécessaire, différer le reste, optimiser les images : ces principes valent plus que n'importe quelle astuce de dernière minute.

L'enjeu n'est pas que technique. Un site rapide retient ses visiteurs, convertit mieux et reste accessible à ceux qui ont une connexion modeste. La vitesse est une forme de respect envers l'utilisateur, pas un caprice d'ingénieur.`,
    },
    {
        topic: "Web",
        title: "Accessibilité : ce n'est pas optionnel",
        content: `L'accessibilité est trop souvent reléguée au rang de bonus qu'on traitera « si on a le temps ». C'est une erreur de principe : un site inaccessible exclut purement et simplement une partie de ses utilisateurs.

La bonne nouvelle, c'est qu'une grande partie de l'accessibilité découle de bonnes pratiques de base. Utiliser le bon élément HTML pour le bon usage, structurer ses titres, décrire ses images, garantir la navigation au clavier : rien de sorcier, juste de la rigueur.

Et ces efforts profitent à tout le monde, pas seulement aux personnes en situation de handicap. Un site bien structuré est mieux référencé, plus facile à utiliser sur mobile et plus robuste. L'accessibilité, c'est de la qualité, pas de la charité.`,
    },
    {
        topic: "Web",
        title: "HTTP, ce protocole que tout dév devrait connaître",
        content: `On construit des applications web tous les jours sans toujours comprendre le protocole qui les fait fonctionner. C'est dommage, car une bonne maîtrise d'HTTP résout quantité de problèmes qui paraissent autrement mystérieux.

Comprendre les méthodes, les codes de statut et les en-têtes, c'est parler le langage du web. Savoir qu'un 404 signale une ressource absente et un 401 un défaut d'authentification, ce n'est pas de la culture générale, c'est un outil de débogage quotidien.

Les en-têtes, en particulier, méritent qu'on s'y attarde : cache, type de contenu, authentification, sécurité passent par eux. Bien des comportements inexpliqués d'une application deviennent limpides dès qu'on inspecte ce qui circule réellement sur le réseau.`,
    },

    // --- Mobile ---
    {
        topic: "Mobile",
        title: "Natif ou multiplateforme : le vrai débat",
        content: `Choisir entre développement natif et multiplateforme est l'une des premières grandes décisions d'un projet mobile. Et comme souvent, la réponse honnête commence par « ça dépend ».

Le natif offre les meilleures performances et un accès complet aux capacités de chaque système, au prix de deux bases de code distinctes à maintenir. Le multiplateforme mutualise le développement et accélère la livraison, parfois au détriment de la finesse d'intégration.

Le bon arbitrage dépend de vos contraintes : taille de l'équipe, exigences de performance, durée de vie du produit. Pour une application au cœur de votre activité, le natif se justifie ; pour valider rapidement une idée sur deux plateformes, le multiplateforme a tout pour plaire.`,
    },
    {
        topic: "Mobile",
        title: "Penser mobile-first, vraiment",
        content: `Le « mobile-first » est sur toutes les lèvres, mais il est souvent mal compris. Ce n'est pas concevoir pour grand écran puis rétrécir, c'est partir des contraintes du mobile pour remonter ensuite vers le confort du desktop.

Cette inversion a du sens, car le mobile impose des arbitrages salutaires : espace limité, attention fragmentée, interactions tactiles. Ce qui survit à ces contraintes est généralement plus clair et plus efficace, y compris sur grand écran.

Penser mobile-first, c'est aussi accepter de hiérarchiser brutalement. Sur un petit écran, on ne peut pas tout afficher : il faut décider ce qui compte vraiment. Cette discipline de priorisation profite à l'ensemble de l'expérience, quel que soit l'appareil.`,
    },
    {
        topic: "Mobile",
        title: "Publier sur les stores : le parcours du combattant",
        content: `Développer son application n'est que la moitié du chemin. La publier sur les magasins d'applications réserve son lot de surprises, surtout la première fois, et mieux vaut s'y préparer.

Chaque plateforme impose ses règles : processus de validation, exigences techniques, lignes directrices parfois tatillonnes sur le contenu et l'interface. Un rejet pour un détail qu'on n'avait pas anticipé est une expérience que presque tout le monde traverse.

Le conseil le plus utile, c'est de lire attentivement les directives avant de soumettre, et de prévoir du temps pour les allers-retours. La mise en production mobile n'est pas un simple envoi de fichier ; c'est une étape à part entière, qui mérite d'être planifiée comme telle.`,
    },

    // --- Emploi ---
    {
        topic: "Emploi",
        title: "Réussir son entretien technique",
        content: `L'entretien technique angoisse, et c'est normal : on se sent jugé sur sa valeur même de développeur. Pourtant, l'objectif de l'examinateur n'est généralement pas de vous piéger, mais de comprendre comment vous raisonnez.

C'est pourquoi verbaliser sa réflexion compte souvent plus que trouver la solution parfaite. Expliquer votre démarche, énoncer vos hypothèses, reconnaître ce que vous ne savez pas : tout cela révèle une maturité que la seule réponse juste ne montre pas.

La préparation aide, mais pas en mémorisant des solutions. Mieux vaut s'entraîner à résoudre des problèmes à voix haute et à poser des questions de clarification. Un bon entretien ressemble moins à un examen qu'à une séance de travail à deux.`,
    },
    {
        topic: "Emploi",
        title: "Construire un portfolio qui parle pour vous",
        content: `Un bon portfolio vaut souvent mieux qu'un long discours sur un CV. Il montre concrètement ce que vous savez faire, là où les compétences listées ne font qu'affirmer sans prouver.

L'erreur classique est d'accumuler des projets inachevés ou des tutoriels recopiés. Mieux vaut deux ou trois réalisations soignées, finies, documentées, qu'une dizaine de démarrages sans lendemain. La qualité raconte votre rigueur ; la quantité, votre dispersion.

Pensez aussi à expliquer vos choix. Un projet accompagné d'un texte qui détaille le problème résolu, les décisions prises et les difficultés rencontrées en dit bien plus sur vous que le code seul. C'est cette capacité à réfléchir qu'un recruteur cherche.`,
    },
    {
        topic: "Emploi",
        title: "Freelance ou salarié : peser le pour et le contre",
        content: `Le freelancing fait rêver : liberté, tarifs attractifs, choix de ses missions. C'est une réalité, mais qui s'accompagne d'un revers qu'on minimise souvent dans l'enthousiasme du départ.

Être indépendant, c'est aussi gérer la prospection, la comptabilité, les périodes creuses et l'absence de filet en cas de coup dur. Le tarif journalier élevé compense ces charges et ces risques ; il n'est pas un salaire déguisé.

Le salariat, à l'inverse, échange une part d'autonomie contre de la stabilité et un cadre. Aucune des deux voies n'est supérieure dans l'absolu : tout dépend de votre rapport au risque, de votre situation et de ce que vous attendez de votre métier. La bonne réponse est personnelle.`,
    },

    // --- UI/UX ---
    {
        topic: "UI/UX",
        title: "La différence entre UI et UX, enfin",
        content: `On confond UI et UX en permanence, alors que ces deux disciplines, bien que liées, répondent à des questions différentes. L'UI concerne l'apparence et l'interaction : couleurs, typographie, boutons, mise en page. L'UX concerne le ressenti global de l'utilisateur face à un produit.

Une métaphore aide à fixer les idées : l'UI, c'est la façade et la décoration d'un restaurant ; l'UX, c'est l'ensemble de l'expérience, de la réservation à l'addition. Un lieu magnifique au service catastrophique a une belle UI et une mauvaise UX.

Comprendre cette distinction évite bien des malentendus en équipe. Un beau bouton ne sauve pas un parcours confus, et un parcours fluide mérite une interface à sa hauteur. Les deux travaillent ensemble, mais ne se substituent jamais l'un à l'autre.`,
    },
    {
        topic: "UI/UX",
        title: "Designer pour l'utilisateur, pas pour soi",
        content: `Le piège le plus courant en conception, c'est de concevoir pour soi-même. On trouve une interface évidente parce qu'on l'a imaginée, en oubliant qu'on n'est pas représentatif de ceux qui l'utiliseront.

L'utilisateur n'a ni votre connaissance du produit, ni votre patience, ni votre contexte. Ce qui vous paraît limpide peut le dérouter complètement. C'est pourquoi tester avec de vraies personnes, même quelques-unes, révèle des évidences qu'aucune réunion interne n'aurait fait émerger.

Designer pour l'utilisateur, c'est accepter de mettre son ego de côté. Vos préférences esthétiques comptent moins que la capacité des gens à accomplir leur tâche sans friction. L'humilité est, paradoxalement, l'une des premières qualités d'un bon concepteur.`,
    },
    {
        topic: "UI/UX",
        title: "Les micro-interactions qui font la différence",
        content: `Ce qui distingue une interface correcte d'une interface mémorable tient souvent à des détails infimes : un bouton qui réagit au survol, une confirmation discrète après une action, une transition qui guide le regard. Ce sont les micro-interactions.

Leur rôle n'est pas décoratif. Elles rassurent l'utilisateur en lui confirmant que son action a été prise en compte, donnent du rythme à l'expérience et réduisent le sentiment d'attente. Un retour visuel immédiat évite le doute et les clics répétés.

Le danger, comme toujours, est l'excès. Une interface qui s'agite de partout fatigue plus qu'elle ne séduit. Les meilleures micro-interactions sont celles qu'on ne remarque pas consciemment, mais dont l'absence rendrait l'expérience étrangement froide et mécanique.`,
    },
];

// Réactions génériques, assez neutres pour s'appliquer à n'importe quel article.
// On en pioche 3 distinctes par article.
const commentPool = [
    "Merci pour cet article, très clair et bien expliqué.",
    "Je ne suis pas tout à fait d'accord avec le deuxième point, mais l'ensemble se tient.",
    "Exactement le rappel dont j'avais besoin, je garde ça sous le coude.",
    "Bonne synthèse. J'aurais ajouté un mot sur l'outillage, mais c'est déjà complet.",
    "Article utile, surtout pour quelqu'un qui débute sur le sujet.",
    "J'ai appris quelque chose aujourd'hui, merci du partage.",
    "Intéressant, ça rejoint mon expérience sur mes derniers projets.",
    "Pas convaincu sur tout, mais ça donne matière à réflexion.",
    "Clair, concis, sans bla-bla inutile. Parfait.",
    "Tu peux développer la partie sur la mise en pratique ? Ça m'intéresse.",
];

/**
 * Tire `n` éléments distincts au hasard d'un tableau (copie mélangée tronquée).
 */
function pickDistinct<T>(arr: readonly T[], n: number): T[] {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

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

    // Utilisateurs : upsert sur l'email (unique). On hache le mot de passe une
    // seule fois, il est commun à tous les comptes de démo.
    const password = bcrypt.hashSync(DEMO_PASSWORD, 10);
    const createdUsers = [];
    for (const user of users) {
        createdUsers.push(await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: { ...user, password },
        }));
    }

    // Articles + commentaires : on repart d'une table propre pour rester
    // idempotent (aucune clé naturelle sur Article). Commentaires purgés
    // d'abord, contrainte de clé étrangère oblige.
    await prisma.comment.deleteMany();
    await prisma.article.deleteMany();

    // Index des thèmes par nom pour relier chaque article à son thème.
    const topicByName = new Map(
        (await prisma.topic.findMany()).map((topic) => [topic.name, topic]),
    );

    const baseTime = Date.now();
    let articleCount = 0;
    let commentCount = 0;

    for (const [index, article] of articles.entries()) {
        const topic = topicByName.get(article.topic);
        if (!topic) {
            throw new Error(`Thème introuvable pour l'article « ${article.title} » : ${article.topic}`);
        }

        // Auteur attribué par rotation déterministe (répartition régulière).
        const author = createdUsers[index % createdUsers.length];
        // Dates échelonnées (1 h d'écart) pour un fil ordonné de façon réaliste.
        const createdAt = new Date(baseTime - articleCount++ * 3_600_000);

        const created = await prisma.article.create({
            data: {
                authorId: author.id,
                topicId: topic.id,
                title: article.title,
                content: article.content,
                createdAt,
            },
        });

        // 3 commentaires postés par des non-auteurs (utilisateurs distincts),
        // textes distincts, datés juste après l'article.
        const commenters = pickDistinct(
            createdUsers.filter((user) => user.id !== author.id),
            3,
        );
        const texts = pickDistinct(commentPool, commenters.length);
        for (const [i, commenter] of commenters.entries()) {
            await prisma.comment.create({
                data: {
                    authorId: commenter.id,
                    articleId: created.id,
                    content: texts[i],
                    createdAt: new Date(createdAt.getTime() + (i + 1) * 60_000),
                },
            });
            commentCount++;
        }
    }

    console.log(
        `Seed terminé : ${topics.length} thèmes, ${createdUsers.length} utilisateurs, ${articleCount} articles, ${commentCount} commentaires.`,
    );
}

main()
    .catch((error) => {
        console.error("Seed échoué :", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
