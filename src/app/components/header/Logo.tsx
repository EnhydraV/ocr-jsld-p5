import Image from "next/image";
import {cn} from "@/src/lib/utils";

type LogoProps = {className?: string; priority?: boolean};

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
