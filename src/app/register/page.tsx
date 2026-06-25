"use client";

import {useActionState} from "react";
import {registerAction, type RegisterState} from "@/src/lib/users/register.action";
import HeaderLogin from "@/src/app/components/header/HeaderLogin";
import AccountForm from "@/src/app/components/forms/AccountForm";

const initialState: RegisterState = {};

/**
 * Page d'inscription (Client Component). Pilotée par `useActionState` autour de
 * la Server Action `registerAction`. Le formulaire lui-même est mutualisé avec
 * l'édition de profil via {@link AccountForm}. En cas de succès, la Server Action
 * redirige vers `/login?registered=1`.
 */
export default function Page() {
    const [state, formAction, pending] = useActionState(registerAction, initialState);

    return (
        <div className="flex min-h-screen flex-col">
            <HeaderLogin/>
            <div className="flex flex-1 flex-col items-center justify-center">
                <AccountForm
                    title="Inscription"
                    state={state}
                    formAction={formAction}
                    pending={pending}
                    submitLabel="S'inscrire"
                    pendingLabel="Inscription…"
                    passwordRequired
                />
            </div>
        </div>
    );
}
