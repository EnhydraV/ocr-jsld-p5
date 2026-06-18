"use client";
import {signIn} from "next-auth/react";
import {useState} from "react";
import {redirect} from "next/navigation";
import HeaderLogin from "@/src/app/components/HeaderLogin";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            redirect("/feed");
        }
    };

    return (
        <>
            <HeaderLogin/>
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <h2>Connexion</h2>
                {error && <p style={{color: "red"}}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Se connecter</button>
                </form>
            </div>
        </>
    );
}
