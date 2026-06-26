import type {ComponentProps} from "react";
import {cn} from "@/src/lib/utils";

// Zone de texte multiligne, calquée sur Input (mêmes tokens border-input / ring).
export default function Textarea({className, ...props}: ComponentProps<"textarea">) {
    return (
        <textarea
            className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
            )}
            {...props}
        />
    );
}
