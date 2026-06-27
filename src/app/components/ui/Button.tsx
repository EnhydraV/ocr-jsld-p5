import {cva, type VariantProps} from "class-variance-authority";
import type {ComponentProps} from "react";
import {cn} from "@/src/lib/utils";

// Variantes de bouton centralisées (DRY) : réutilisables sur un <button> ou,
// via `buttonVariants(...)`, sur un <Link> (cf. boutons de la home).
export const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:bg-primary/90",
                outline:
                    "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                blackOutline:
                    "border-2 border-black text-black hover:bg-black hover:text-white",
                muted:
                    "bg-muted-foreground text-background",
            },
            size: {
                default: "px-6 py-3",
                sm: "px-4 py-2 text-sm",
            },
        },
        defaultVariants: {variant: "primary", size: "default"},
    },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export default function Button({className, variant, size, ...props}: ButtonProps) {
    return <button className={cn(buttonVariants({variant, size}), className)} {...props} />;
}

