// Constantes partagées entre le global-setup (semis de la base) et les specs.
// Les identifiants ci-dessous correspondent exactement aux données semées.

/** Chemin de l'état de session enregistré par le projet `setup`. */
export const STORAGE_STATE = "e2e/.auth/user.json";

/** Utilisateur principal, connecté pour les scénarios authentifiés. */
export const E2E_USER = {
    username: "victor_e2e",
    email: "victor.e2e@mdd.dev",
    password: "Azerty#123", // conforme à la politique du brief
};

/** Auteur des articles semés (distinct de l'utilisateur connecté). */
export const AUTHOR_USER = {
    username: "juliette_e2e",
    email: "juliette.e2e@mdd.dev",
};

/** Thèmes semés et leur rôle dans les tests. */
export const TOPICS = {
    /** Suivi par l'utilisateur et porteur des articles → alimente le fil. */
    subscribed: "JavaScript",
    /** Non suivi → cible du test d'abonnement (page « Thèmes »). */
    toSubscribe: "TypeScript",
    /** Suivi → cible du test de désabonnement (page « Profil »), sans article. */
    toUnsubscribe: "Python",
};

/** Articles semés dans le thème suivi, datés pour tester le tri. */
export const ARTICLES = {
    older: "Découvrir les closures en JavaScript",
    newer: "Comprendre async/await en JavaScript",
};
