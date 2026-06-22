"use client";
import {signIn} from "next-auth/react";
import {Suspense, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import HeaderLogin from "@/src/app/components/HeaderLogin";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";

// `useSearchParams` impose un périmètre Suspense (sinon Next bascule toute la
// page en rendu client). On isole donc le formulaire ici.
export default function Login() {
    return (
        <Suspense>
            <LoginForm/>
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    // `?registered=1` posé par la Server Action d'inscription : confirme la
    // création du compte sur l'écran de connexion.
    const justRegistered = useSearchParams().get("registered") === "1";
    // Champ unique « E-mail ou nom d'utilisateur » (cf. maquette). NextAuth
    // attend la clé `email`, que `authorize` résout via findByEmailOrUsername.
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);
        setError("");

        const result = await signIn("credentials", {
            email: identifier,
            password,
            redirect: false,
        });

        if (result?.error) {
            // Message générique : on n'indique pas lequel des deux est faux.
            setError("Identifiant ou mot de passe incorrect.");
            setPending(false);
        } else {
            router.push("/feed");
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <HeaderLogin/>

            <div className="flex flex-1 flex-col items-center justify-center">
                <div className="w-full space-y-6">
                    <h1 className="text-center text-2xl font-bold text-foreground">Se connecter</h1>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-110 mx-auto">
                        {justRegistered && !error && (
                            <p
                                role="status"
                                aria-live="polite"
                                className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700"
                            >
                                Compte créé. Tu peux maintenant te connecter.
                            </p>
                        )}

                        {error && (
                            <p
                                role="alert"
                                aria-live="polite"
                                className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="identifier" className="text-sm font-medium text-foreground">
                                E-mail ou nom d&apos;utilisateur
                            </label>
                            <Input
                                id="identifier"
                                name="identifier"
                                type="text"
                                autoComplete="username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
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
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" disabled={pending} className="w-full">
                            {pending ? "Connexion…" : "Se connecter"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
