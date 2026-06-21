import type {ComponentProps} from "react";
import {cn} from "@/src/lib/utils";

// Champ texte standard, stylé sur les tokens du thème (border-input / ring).
export default function Input({className, ...props}: ComponentProps<"input">) {
    return (
        <input
            className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
            )}
            {...props}
        />
    );
}
