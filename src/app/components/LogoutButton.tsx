"use client";

import {signOut} from "next-auth/react";

// Seul ce bouton a besoin d'interactivité : on isole la frontière client
// ici pour garder Header en Server Component.
export default function LogoutButton() {
    return (
        <button onClick={() => signOut({callbackUrl: "/"})}>
            Se déconnecter
        </button>
    );
}
