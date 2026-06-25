"use client";

import {useActionState} from "react";
import {registerAction, type RegisterState} from "@/src/lib/users/register.action";
import HeaderLogin from "@/src/app/components/header/HeaderLogin";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";

const initialState: RegisterState = {};

export default function Page() {
    const [state, formAction, pending] = useActionState(registerAction, initialState);

    return (
        <div className="flex min-h-screen flex-col">
            <HeaderLogin/>

            <div className="flex flex-1 flex-col items-center justify-center">
                <div className="w-full space-y-6">
                    <h1 className="text-center text-2xl font-bold text-foreground">Inscription</h1>

                    {state.error && (
                        <p
                            role="alert"
                            aria-live="polite"
                            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {state.error}
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
                                defaultValue={state.values?.username}
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
                                defaultValue={state.values?.email}
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
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un
                                caractère spécial.
                            </p>
                        </div>

                        <Button type="submit" disabled={pending} className="w-full">
                            {pending ? "Inscription…" : "S'inscrire"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
