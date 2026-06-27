"use client";

import {useActionState} from "react";
import {postAction, type PostState} from "@/src/lib/articles/post.action";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";
import Select from "@/src/app/components/ui/Select";
import Textarea from "@/src/app/components/ui/Textarea";

const initialState: PostState = {};

type ArticleFormProps = {
    /** Thèmes proposés dans le menu déroulant (chargés côté serveur). */
    topics: {id: number; name: string}[];
};

/**
 * Formulaire de rédaction d'article (client) piloté par `useActionState`. En cas
 * de succès, `postAction` redirige vers le détail de l'article créé ; en cas
 * d'échec, le message d'erreur s'affiche et les saisies sont réinjectées via
 * `state.values`.
 */
export default function ArticleForm({topics}: ArticleFormProps) {
    const [state, formAction, pending] = useActionState(postAction, initialState);

    return (
        <form action={formAction} className="space-y-5">
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
                <label htmlFor="topicId" className="text-sm font-medium text-foreground">
                    Thème
                </label>
                <Select
                    id="topicId"
                    name="topicId"
                    defaultValue={state.values?.topicId ? String(state.values.topicId) : ""}
                    required
                >
                    <option value="" disabled>
                        Sélectionner un thème
                    </option>
                    {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                            {topic.name}
                        </option>
                    ))}
                </Select>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                    Titre
                </label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Titre de l'article"
                    defaultValue={state.values?.title}
                    required
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="content" className="text-sm font-medium text-foreground">
                    Contenu
                </label>
                <Textarea
                    id="content"
                    name="content"
                    rows={10}
                    placeholder="Contenu de l'article"
                    defaultValue={state.values?.content}
                    required
                />
            </div>

            <div className="flex justify-center">
                <Button type="submit" disabled={pending}>
                    {pending ? "Création…" : "Créer"}
                </Button>
            </div>
        </form>
    );
}
