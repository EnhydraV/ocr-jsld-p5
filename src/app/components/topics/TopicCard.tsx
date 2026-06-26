import type {ReactNode} from "react";

type TopicCardProps = {
    name: string;
    description: string;
    /** Bouton d'action affiché en bas de carte (s'abonner / se désabonner / état). */
    action: ReactNode;
};

/**
 * Carte d'un thème (présentationnel) : nom, description et un emplacement
 * `action` pour le bouton. Réutilisable entre la page « Thèmes » (s'abonner)
 * et le profil (se désabonner). `flex-1` sur la description aligne les boutons
 * en bas quelle que soit la hauteur du texte.
 */
export default function TopicCard({name, description, action}: TopicCardProps) {
    return (
        <article className="flex flex-col gap-3 rounded-lg bg-muted p-5">
            <h2 className="font-semibold text-foreground">{name}</h2>
            <p className="flex-1 text-sm text-foreground">{description}</p>
            <div className="flex justify-center pt-1">{action}</div>
        </article>
    );
}
