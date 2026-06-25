import * as z from "zod";

/**
 * Schéma de validation de l'inscription. Les messages sont en français car
 * affichés tels quels à l'utilisateur. La politique du mot de passe est
 * imposée par le brief.
 */
export const RegisterSchema = z.object({
    username: z
        .string()
        .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
        .max(20, "Le nom d'utilisateur ne doit pas dépasser 20 caractères."),
    email: z.string().email("L'adresse email n'est pas valide."),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
        .max(20, "Le mot de passe ne doit pas dépasser 20 caractères.")
        // Politique imposée par le brief : 1 minuscule, 1 majuscule, 1 chiffre,
        // 1 caractère spécial.
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule.")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
        .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial."),
});

/** Schéma de validation de la connexion (identifiant + mot de passe). */
export const LoginSchema = z.object({
    usernameoremail: z.string(),
    password: z.string()
})

/** Type des données d'inscription, inféré depuis {@link RegisterSchema}. */
export type RegisterDto = z.infer<typeof RegisterSchema>;
