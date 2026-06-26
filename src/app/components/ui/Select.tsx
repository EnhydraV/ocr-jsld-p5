import type {ComponentProps} from "react";
import {cn} from "@/src/lib/utils";

// Menu déroulant natif, stylé sur les mêmes tokens qu'Input/Textarea
// (border-input / ring) pour une cohérence visuelle des champs de formulaire.
export default function Select({className, ...props}: ComponentProps<"select">) {
    return (
        <select
            className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
            )}
            {...props}
        />
    );
}
