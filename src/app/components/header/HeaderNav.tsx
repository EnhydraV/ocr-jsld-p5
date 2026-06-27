"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState, type ReactNode} from "react";
import {FocusTrap} from "focus-trap-react";
import {Menu, User, X} from "lucide-react";
import {cn} from "@/src/lib/utils";
import LogoutButton from "@/src/app/components/header/LogoutButton";

/** Liens de navigation principaux, partagés entre desktop et mobile. */
const NAV_LINKS = [
    {href: "/feed", label: "Articles"},
    {href: "/topics", label: "Thèmes"},
];

type NavItemProps = {
    href: string;
    /** Vrai si l'item pointe vers la page courante. */
    active: boolean;
    /** Classes communes aux deux états. */
    className?: string;
    /** Classes ajoutées quand l'item est actif. */
    activeClassName?: string;
    /** Classes ajoutées quand l'item est cliquable (inactif). */
    inactiveClassName?: string;
    "aria-label"?: string;
    onClick?: () => void;
    children: ReactNode;
};

/**
 * Élément de navigation. Rendu comme un `<Link>` cliquable, sauf lorsqu'il
 * désigne la page courante : il devient alors un `<span aria-current="page">`
 * non cliquable. Cela supprime le lien redondant vers soi-même (signalé par WAVE)
 * et annonce sa position actuelle aux lecteurs d'écran.
 */
function NavItem({href, active, className, activeClassName, inactiveClassName, onClick, children, ...rest}: NavItemProps) {
    if (active) {
        return (
            <span aria-current="page" className={cn(className, activeClassName)} {...rest}>
                {children}
            </span>
        );
    }
    return (
        <Link href={href} onClick={onClick} className={cn(className, inactiveClassName)} {...rest}>
            {children}
        </Link>
    );
}

/**
 * Navigation de la zone connectée.
 * - Desktop (≥ sm) : nav en ligne, lien actif mis en évidence (usePathname) et
 *   rendu non cliquable via {@link NavItem} (`aria-current="page"`).
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
                    <NavItem
                        key={link.href}
                        href={link.href}
                        active={isActive(link.href)}
                        className="transition-colors"
                        activeClassName="font-semibold text-primary"
                        inactiveClassName="text-foreground hover:text-primary"
                    >
                        {link.label}
                    </NavItem>
                ))}
                <NavItem
                    href="/profile"
                    active={isActive("/profile")}
                    aria-label="Mon profil"
                    className="flex size-9 items-center justify-center rounded-full bg-muted transition-colors"
                    activeClassName="text-primary"
                    inactiveClassName="text-foreground hover:text-primary"
                >
                    <User className="size-5"/>
                </NavItem>
            </nav>

            {/* Mobile : bouton burger (ouvre le panneau) */}
            <button
                type="button"
                aria-label="Ouvrir le menu"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen(true)}
                className="cursor-pointer text-foreground sm:hidden"
            >
                <Menu className="size-6"/>
            </button>

            {/* Mobile : overlay blanc opaque + panneau glissant depuis la droite.
                Toujours monté pour animer le glissement ; `inert` quand fermé, ce qui
                le retire d'un coup du clavier, des clics et de l'arbre d'accessibilité. */}
            <div
                className={cn(
                    "fixed inset-0 z-50 sm:hidden",
                    open ? "pointer-events-auto" : "pointer-events-none",
                )}
                inert={!open}
            >
                {/* Overlay : clic = fermeture. Souris uniquement (tabIndex=-1) :
                    la fermeture au clavier passe par la croix et Échap. */}
                <button
                    type="button"
                    aria-label="Fermer le menu"
                    tabIndex={-1}
                    onClick={() => setOpen(false)}
                    className={cn(
                        "absolute inset-0 bg-background transition-opacity",
                        open ? "opacity-50" : "opacity-0",
                    )}
                />

                {/* Panneau latéral droit (dialogue modal). FocusTrap enferme le clavier
                    dans le panneau tant qu'il est ouvert (`active={open}`) : Tab boucle
                    à l'intérieur, le focus y entre à l'ouverture et revient au burger à
                    la fermeture. Échap et un clic sur l'overlay désactivent le piège, ce
                    qui referme le menu via `onDeactivate`. */}
                <FocusTrap
                    active={open}
                    focusTrapOptions={{
                        onDeactivate: () => setOpen(false),
                        escapeDeactivates: true,
                        clickOutsideDeactivates: true,
                    }}
                >
                    <nav
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu de navigation"
                        className={cn(
                            "absolute inset-y-0 right-0 flex w-64 flex-col items-end gap-5 border-l border-border bg-background p-6 transition-transform",
                            open ? "translate-x-0" : "translate-x-full",
                        )}
                    >
                        {/* Bouton de fermeture (croix) en haut du panneau */}
                        <button
                            type="button"
                            aria-label="Fermer le menu"
                            aria-keyshortcuts="Escape"
                            onClick={() => setOpen(false)}
                            className="cursor-pointer text-foreground transition-colors hover:text-primary"
                        >
                            <X className="size-6"/>
                        </button>
                        <LogoutButton className="text-left"/>
                        {NAV_LINKS.map((link) => (
                            <NavItem
                                key={link.href}
                                href={link.href}
                                active={isActive(link.href)}
                                onClick={() => setOpen(false)}
                                className="transition-colors"
                                activeClassName="font-semibold text-primary"
                                inactiveClassName="text-foreground hover:text-primary"
                            >
                                {link.label}
                            </NavItem>
                        ))}
                        {/* Icône profil ancrée tout en bas du panneau (`mt-auto`) */}
                        <NavItem
                            href="/profile"
                            active={isActive("/profile")}
                            aria-label="Mon profil"
                            onClick={() => setOpen(false)}
                            className="mt-auto flex size-9 items-center justify-center rounded-full bg-muted transition-colors"
                            activeClassName="text-primary"
                            inactiveClassName="text-foreground hover:text-primary"
                        >
                            <User className="size-5"/>
                        </NavItem>
                    </nav>
                </FocusTrap>
            </div>
        </>
    );
}
