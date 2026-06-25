"use client";

import {signOut} from "next-auth/react";
import {cn} from "@/src/lib/utils";

// Seul ce bouton a besoin d'interactivité : on isole la frontière client
// ici pour garder Header en Server Component.
type LogoutButtonProps = {className?: string};

export default function LogoutButton({className}: LogoutButtonProps) {
    return (
        <button
            type="button"
            onClick={() => signOut({callbackUrl: "/"})}
            className={cn(
                "cursor-pointer font-semibold text-destructive transition-colors hover:text-destructive/80",
                className,
            )}
        >
            Se déconnecter
        </button>
    );
}
