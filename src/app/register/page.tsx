"use client";

import {useActionState} from "react";
import {registerAction, type RegisterState} from "@/src/lib/users/register.action";
import HeaderLogin from "@/src/app/components/HeaderLogin";

const initialState: RegisterState = {};

export default function Page() {
    const [state, formAction, pending] = useActionState(registerAction, initialState);

    return (
        <>
            <HeaderLogin/>
            <form action={formAction}>
                <h2>Inscription</h2>

                {state.error && (
                    <p role="alert" aria-live="polite" style={{color: "red"}}>
                        {state.error}
                    </p>
                )}

                <label htmlFor="username">Nom d&#39;utilisateur</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="victorthebest_18"
                    defaultValue={state.values?.username}
                    required
                />

                <label htmlFor="email">Adresse e-mail</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="victor@example.fr"
                    defaultValue={state.values?.email}
                    required
                />

                <label htmlFor="password">Mot de passe</label>
                <input id="password" type="password" name="password" required/>

                <button type="submit" disabled={pending}>
                    {pending ? "Inscription ..." : "S'inscrire"}
                </button>
            </form>
        </>
    );
}
