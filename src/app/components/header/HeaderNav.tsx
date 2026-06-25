"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {Menu, User} from "lucide-react";
import {cn} from "@/src/lib/utils";
import LogoutButton from "@/src/app/components/header/LogoutButton";

/** Liens de navigation principaux, partagés entre desktop et mobile. */
const NAV_LINKS = [
    {href: "/feed", label: "Articles"},
    {href: "/topics", label: "Thèmes"},
];

/**
 * Navigation de la zone connectée.
 * - Desktop (≥ sm) : nav en ligne, lien actif souligné en violet (usePathname).
 * - Mobile : bouton burger ouvrant un panneau glissant depuis la droite,
 *   avec overlay cliquable pour fermer. Le panneau reste monté en permanence
 *   pour animer le glissement, mais devient inerte une fois fermé.
 */
export default function HeaderNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Actif si on est sur la route ou une de ses sous-routes (ex. /topics/3).
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <>
            {/* Desktop : nav en ligne. Le violet marque le lien actif (usePathname),
                ce n'est pas une couleur figée. */}
            <nav className="hidden items-center gap-6 sm:flex">
                <LogoutButton/>
                {NAV_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "transition-colors hover:text-primary",
                            isActive(link.href) ? "font-semibold text-primary" : "text-foreground",
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
                <Link
                    href="/profile"
                    aria-label="Mon profil"
                    className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:text-primary"
                >
                    <User className="size-5"/>
                </Link>
            </nav>

            {/* Mobile : bouton burger (ouvre le panneau) */}
            <button
                type="button"
                aria-label="Ouvrir le menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="cursor-pointer text-foreground sm:hidden"
            >
                <Menu className="size-6"/>
            </button>

            {/* Mobile : overlay blanc opaque + panneau glissant depuis la droite.
                Toujours monté pour animer le glissement ; inerte quand fermé. */}
            <div
                className={cn(
                    "fixed inset-0 z-50 sm:hidden",
                    open ? "pointer-events-auto" : "pointer-events-none",
                )}
                aria-hidden={!open}
            >
                {/* Overlay : clic = fermeture (bouton pour rester accessible au clavier) */}
                <button
                    type="button"
                    aria-label="Fermer le menu"
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className={cn(
                        "absolute inset-0 bg-background transition-opacity",
                        open ? "opacity-50" : "opacity-0",
                    )}
                />

                {/* Panneau latéral droit */}
                <nav
                    className={cn(
                        "absolute inset-y-0 right-0 flex w-64 flex-col gap-5 border-l border-border bg-background p-6 transition-transform",
                        open ? "translate-x-0" : "translate-x-full",
                    )}
                >
                    <LogoutButton className="text-left"/>
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            tabIndex={open ? 0 : -1}
                            onClick={() => setOpen(false)}
                            className="text-foreground transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {/* Icône profil ancrée tout en bas du panneau (`mt-auto`) */}
                    <Link
                        href="/profile"
                        aria-label="Mon profil"
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                        className="mt-auto flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:text-primary"
                    >
                        <User className="size-5"/>
                    </Link>
                </nav>
            </div>
        </>
    );
}
