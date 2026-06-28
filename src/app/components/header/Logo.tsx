import Image from "next/image";
import {cn} from "@/src/lib/utils";

type LogoProps = {className?: string; priority?: boolean};

/**
 * Logo « Monde de Dév ».
 * @param className - Classes supplémentaires (par défaut `w-40`).
 * @param priority - Précharge l'image. Activé par défaut : le logo est toujours en
 *   tête de header et c'est le même fichier (mis en cache après le premier chargement),
 *   donc le préchargement est mutualisé. Passer `false` pour le désactiver au cas par cas.
 */
export default function Logo({className, priority = true}: LogoProps) {
    return (
        <Image
            src="/logo.png"
            alt="Monde de Dév"
            width={824}
            height={476}
            priority={priority}
            className={cn("h-auto w-40", className)}
        />
    );
}
