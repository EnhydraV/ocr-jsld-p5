import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import Logo from "@/src/app/components/header/Logo";

// Header des formulaires (connexion / inscription). La maquette diffère selon
// le viewport (incohérence assumée côté design) :
// * Desktop : logo calé à gauche dans une barre supérieure séparée d'une ligne, flèche de retour dessous.
// * Mobile : flèche de retour en haut, puis logo (plus gros) centré dessous, sans ligne de séparation.
export default function HeaderLogin() {
    return (
        <header className="flex flex-col">
            <div className="order-2 flex justify-center py-4 sm:order-1 sm:-mx-4 sm:justify-start sm:border-b sm:border-border sm:px-4">
                <Logo className="w-44 sm:w-32"/>
            </div>

            <div className="order-1 pt-4 sm:order-2 sm:pt-6">
                <Link
                    href="/"
                    aria-label="Retour à l'accueil"
                    className="inline-flex text-foreground transition-colors hover:text-primary"
                >
                    <ArrowLeft className="size-6"/>
                </Link>
            </div>
        </header>
    );
}
