"use client";

import {useActionState} from "react";
import {profileAction, type ProfileState} from "@/src/lib/users/profile.action";
import AccountForm from "@/src/app/components/forms/AccountForm";

const initialState: ProfileState = {};

type ProfileFormProps = {
    /** Valeurs actuelles pour pré-remplir les champs (issues du serveur). */
    initialValues: {username: string; email: string};
};

/**
 * Enveloppe client du formulaire de profil : pilote {@link AccountForm} via
 * `useActionState(profileAction)`. Pré-rempli avec les valeurs actuelles, mot de
 * passe optionnel, affiche une confirmation au succès.
 */
export default function ProfileForm({initialValues}: ProfileFormProps) {
    const [state, formAction, pending] = useActionState(profileAction, initialState);

    return (
        <AccountForm
            title="Profil utilisateur"
            state={state}
            formAction={formAction}
            pending={pending}
            submitLabel="Sauvegarder"
            pendingLabel="Sauvegarde…"
            passwordRequired={false}
            defaultValues={initialValues}
            successMessage="Profil mis à jour."
        />
    );
}
