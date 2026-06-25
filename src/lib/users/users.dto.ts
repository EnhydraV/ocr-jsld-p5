import * as z from "zod";

// Règles de champ partagées entre l'inscription et la mise à jour du profil :
// une seule source de vérité par champ. Les messages sont en français car
// affichés tels quels à l'utilisateur.
const usernameSchema = z
    .string()
    .trim()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
    .max(20, "Le nom d'utilisateur ne doit pas dépasser 20 caractères.");

const emailSchema = z.string().trim().email("L'adresse email n'est pas valide.");

// Politique imposée par le brief : 8–20 caractères, 1 minuscule, 1 majuscule,
// 1 chiffre, 1 caractère spécial.
const passwordSchema = z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(20, "Le mot de passe ne doit pas dépasser 20 caractères.")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule.")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial.");

/**
 * Schéma de validation de l'inscription. La politique du mot de passe est
 * imposée par le brief.
 */
export const RegisterSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

/**
 * Schéma de validation de la mise à jour du profil. Le mot de passe est
 * **optionnel** : une chaîne vide (champ laissé tel quel) signifie « ne pas
 * changer » et n'est donc pas soumise à la politique de complexité ; toute
 * valeur non vide, en revanche, doit la respecter.
 */
export const UpdateProfileSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: z.union([z.literal(""), passwordSchema]).optional(),
});

/** Schéma de validation de la connexion (identifiant + mot de passe). */
export const LoginSchema = z.object({
    usernameoremail: z.string().trim(),
    password: z.string()
})

/** Type des données d'inscription, inféré depuis {@link RegisterSchema}. */
export type RegisterDto = z.infer<typeof RegisterSchema>;

/** Type des données de mise à jour du profil, inféré depuis {@link UpdateProfileSchema}. */
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
