"use client";

import {useActionState} from "react";
import {Send} from "lucide-react";
import type {CommentState} from "@/src/lib/comments/comment.action";
import Textarea from "@/src/app/components/ui/Textarea";

const initialState: CommentState = {};

type CommentFormProps = {
    /**
     * `commentAction` déjà liée à l'id de l'article via `.bind(null, articleId)`
     * côté serveur : sa signature correspond alors à celle attendue par
     * `useActionState` (`(prev, formData) => …`).
     */
    action: (prev: CommentState, formData: FormData) => Promise<CommentState>;
};

/**
 * Formulaire de commentaire (client) piloté par `useActionState`. En cas de
 * succès, la Server Action redirige vers le détail de l'article : la page se
 * recharge avec le nouveau commentaire, le formulaire repart donc vierge. En cas
 * d'échec, le message d'erreur s'affiche et la saisie est réinjectée.
 */
export default function CommentForm({action}: CommentFormProps) {
    const [state, formAction, pending] = useActionState(action, initialState);

    return (
        <form action={formAction} className="space-y-3">
            {state.error && (
                <p
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {state.error}
                </p>
            )}

            <div className="space-y-1.5">
                <label htmlFor="content" className="text-sm font-medium text-foreground">
                    Ajouter un commentaire
                </label>
                <Textarea
                    id="content"
                    name="content"
                    rows={4}
                    placeholder="Écrivez ici votre commentaire"
                    defaultValue={state.values?.content}
                    required
                />
            </div>

            <div className="flex justify-end">
                {/* Icône avion en papier nue (pas de fond ni contour) : libellé porté
                    par aria-label, couleur violette via text-primary. */}
                <button
                    type="submit"
                    disabled={pending}
                    aria-label="Publier le commentaire"
                    className="cursor-pointer text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-60"
                >
                    <Send className="size-8" aria-hidden/>
                </button>
            </div>
        </form>
    );
}
