import Image from "next/image";
import {cn} from "@/src/lib/utils";

type LogoProps = {className?: string; priority?: boolean};

/**
 * Logo « Monde de Dév ».
 * @param className - Classes supplémentaires (par défaut `w-40`).
 * @param priority - Précharge l'image (à activer si le logo est au-dessus de la ligne de flottaison).
 */
export default function Logo({className, priority}: LogoProps) {
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
