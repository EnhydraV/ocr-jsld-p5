"use client";
import {signIn} from "next-auth/react";
import {Suspense, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import HeaderLogin from "@/src/app/components/header/HeaderLogin";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";

/**
 * Page de connexion. `useSearchParams` (lu dans `LoginForm`) impose un périmètre
 * Suspense, sinon Next bascule toute la page en rendu client : on isole donc le
 * formulaire derrière ce `<Suspense>`.
 */
export default function Login() {
    return (
        <Suspense>
            <LoginForm/>
        </Suspense>
    );
}

/**
 * Formulaire de connexion (Client Component). Appelle `signIn("credentials")`
 * sans redirection automatique pour gérer l'erreur localement, puis route en cas
 * de succès vers la page initialement demandée (`?callbackUrl=…` posé par le
 * proxy, validé par `safeCallbackUrl`) ou le fil à défaut. Affiche un bandeau de
 * confirmation si l'utilisateur arrive depuis une inscription (`?registered=1`).
 */
/**
 * N'accepte qu'un chemin interne comme cible de redirection après connexion.
 * Bloque les redirections ouvertes (`https://evil.com`, `//evil.com`) qu'un
 * `?callbackUrl=…` forgé tenterait d'injecter.
 * @param url - Valeur brute lue dans la query.
 * @returns Le chemin si interne, sinon `/feed` par défaut.
 */
function safeCallbackUrl(url: string | null): string {
    return url && url.startsWith("/") && !url.startsWith("//") ? url : "/feed";
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // `?registered=1` posé par la Server Action d'inscription : confirme la
    // création du compte sur l'écran de connexion.
    const justRegistered = searchParams.get("registered") === "1";
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
            // Retour à la page initialement demandée (posée par le proxy), à
            // défaut le fil. Validé contre les redirections ouvertes.
            router.push(safeCallbackUrl(searchParams.get("callbackUrl")));
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
