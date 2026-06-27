import Link from "next/link";
import HeaderHome from "@/src/app/components/header/HeaderHome";
import {buttonVariants} from "@/src/app/components/ui/Button";
import {cn} from "@/src/lib/utils";

/**
 * Page d'accueil non connectée : logo centré et deux accès « Se connecter » /
 * « S'inscrire ». Les utilisateurs déjà authentifiés sont redirigés vers le fil
 * en amont par le videur (`proxy.ts`).
 */
export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-10">
            <HeaderHome/>

            {/* Boutons empilés sur mobile, côte à côte dès `sm`. */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <Link href="/login" className={cn(buttonVariants({variant: "primary"}), "w-full sm:w-auto")}>
                    Se connecter
                </Link>
                <Link href="/register" className={cn(buttonVariants({variant: "primary"}), "w-full sm:w-auto")}>
                    S&apos;inscrire
                </Link>
            </div>
        </div>
    );
}
