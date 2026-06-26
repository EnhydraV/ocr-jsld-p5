import Link from "next/link";

type ArticleCardProps = {
    id: number;
    title: string;
    authorName: string;
    createdAt: Date;
    content: string;
};

// Format de date français réutilisé pour toutes les cartes (ex. « 25 juin 2026 »).
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {dateStyle: "long"});

/**
 * Carte d'article dans le fil : titre, date + auteur, extrait du contenu.
 * Toute la carte est un lien vers le détail de l'article. L'extrait est tronqué
 * visuellement via `line-clamp` (pas de découpe de chaîne).
 */
export default function ArticleCard({id, title, authorName, createdAt, content}: ArticleCardProps) {
    return (
        <Link
            href={`/article/${id}`}
            className="flex flex-col gap-3 rounded-lg bg-muted p-5 transition-colors hover:bg-muted/70"
        >
            <h2 className="font-semibold text-foreground">{title}</h2>
            <div className="flex justify-between text-sm text-foreground">
                <span>{dateFormatter.format(createdAt)}</span>
                <span>{authorName}</span>
            </div>
            <p className="line-clamp-4 text-sm text-foreground">{content}</p>
        </Link>
    );
}
