import Link from "next/link";
import Logo from "@/src/app/components/header/Logo";
import HeaderNav from "@/src/app/components/header/HeaderNav";

/**
 * Header de la zone connectée : logo (lien vers le fil) + navigation.
 *
 * Server Component ; seule la nav interactive est isolée dans HeaderNav.
 * `-mx-4 px-4` étend la ligne de séparation jusqu'aux bords du conteneur
 * (qui porte un gutter `px-4`). Le panneau mobile est géré en `fixed` par
 * HeaderNav, pas besoin d'ancrage ici.
 */
export default function Header() {
    return (
        <header className="-mx-4 flex items-center justify-between border-b border-border px-4 py-4">
            <Link href="/feed" aria-label="Accueil">
                <Logo className="w-28"/>
            </Link>
            <HeaderNav/>
        </header>
    );
}
