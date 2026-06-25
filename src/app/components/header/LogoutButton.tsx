"use client";

import {signOut} from "next-auth/react";
import {cn} from "@/src/lib/utils";

type LogoutButtonProps = {className?: string};

/**
 * Bouton de déconnexion (rouge). Seul élément du header à avoir besoin
 * d'interactivité : on isole ici la frontière client pour garder Header en
 * Server Component.
 * @param className - Classes supplémentaires fusionnées via `cn`.
 */
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
