"use client";

import type {ActionState} from "@/src/lib/actionError";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";

/**
 * État accepté par {@link AccountForm} : superset commun à l'inscription
 * (`RegisterState`) et à l'édition de profil (`ProfileState`, qui ajoute
 * `success`).
 */
export type AccountFormState = ActionState<{username: string; email: string}> & {
    success?: boolean;
};

type AccountFormProps = {
    title: string;
    state: AccountFormState;
    formAction: (formData: FormData) => void;
    pending: boolean;
    submitLabel: string;
    pendingLabel: string;
    /** Mot de passe requis (inscription) ou optionnel (édition de profil). */
    passwordRequired: boolean;
    /** Valeurs initiales (profil) ; les saisies renvoyées en erreur priment. */
    defaultValues?: {username?: string; email?: string};
    /** Message de confirmation affiché quand `state.success` est vrai (profil). */
    successMessage?: string;
};

/**
 * Formulaire de compte mutualisé entre l'inscription et l'édition de profil :
 * mêmes champs (nom d'utilisateur, e-mail, mot de passe) pilotés par
 * `useActionState`. Les différences (titre, libellés, mot de passe requis ou
 * non, pré-remplissage, message de succès) passent par les props. Volontairement
 * **agnostique en largeur/centrage** : c'est la page appelante qui l'enveloppe.
 */
export default function AccountForm({
    title,
    state,
    formAction,
    pending,
    submitLabel,
    pendingLabel,
    passwordRequired,
    defaultValues,
    successMessage,
}: AccountFormProps) {
    return (
        <div className="w-full space-y-6">
            <h1 className="text-center text-2xl font-bold text-foreground">{title}</h1>

            {state.error && (
                <p
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {state.error}
                </p>
            )}

            {state.success && successMessage && (
                <p
                    role="status"
                    aria-live="polite"
                    className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                >
                    {successMessage}
                </p>
            )}

            <form action={formAction} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="username" className="text-sm font-medium text-foreground">
                        Nom d&apos;utilisateur
                    </label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="victorthebest_18"
                        defaultValue={state.values?.username ?? defaultValues?.username}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Adresse e-mail
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="victor@example.fr"
                        defaultValue={state.values?.email ?? defaultValues?.email}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Mot de passe
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required={passwordRequired}
                    />
                    <p className="text-xs text-muted-foreground">
                        {passwordRequired
                            ? "Au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial."
                            : "Laisser vide pour ne pas le changer. Sinon : 8 caractères min., une majuscule, une minuscule, un chiffre et un caractère spécial."}
                    </p>
                </div>

                <Button type="submit" disabled={pending} className="w-full">
                    {pending ? pendingLabel : submitLabel}
                </Button>
            </form>
        </div>
    );
}
