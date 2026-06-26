import Link from "next/link";
import {notFound} from "next/navigation";
import Header from "@/src/app/components/header/Header";
import CommentForm from "./CommentForm";
import {articlesService} from "@/src/lib/articles/articles.service";
import {commentAction} from "@/src/lib/comments/comment.action";

type ArticlePageProps = {
    // En Next 16, `params` et `searchParams` d'un Server Component sont asynchrones.
    params: Promise<{id: string}>;
    searchParams: Promise<{created?: string; comment?: string}>;
};

// Format de date français partagé (article et commentaires).
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {dateStyle: "long"});

/**
 * Détail d'un article : contenu intégral, métadonnées (thème, auteur, date),
 * liste des commentaires et formulaire d'ajout. Server Component ; seul le
 * formulaire (interactif) est isolé côté client. Un id non numérique ou un
 * article introuvable déclenche la page 404 via `notFound()`.
 */
export default async function ArticlePage({params, searchParams}: ArticlePageProps) {
    const {id} = await params;
    const {created, comment} = await searchParams;

    const articleId = Number(id);
    if (!Number.isInteger(articleId)) {
        notFound();
    }

    const article = await articlesService.getArticleById(articleId);
    if (!article) {
        notFound();
    }

    // Le contenu stocke ses paragraphes séparés par une ligne vide.
    const paragraphs = article.content.split(/\n\s*\n/).filter(Boolean);
    // `commentAction` attend l'id de l'article en premier argument : on le lie
    // ici (signé par Next) pour le passer au formulaire client.
    const boundCommentAction = commentAction.bind(null, article.id);

    return (
        <>
            <Header/>
            <section className="mx-auto max-w-180 space-y-8 py-8">
                <Link
                    href="/feed"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                    ← Retour au fil
                </Link>

                {(created || comment) && (
                    <p
                        role="status"
                        aria-live="polite"
                        className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                    >
                        {created ? "Article publié." : "Commentaire ajouté."}
                    </p>
                )}

                <article className="space-y-5">
                    <h1 className="text-3xl font-bold text-foreground">{article.title}</h1>
                    {/* Maquette : date, auteur et thème sur une même ligne sous le titre. */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{dateFormatter.format(article.createdAt)}</span>
                        <span>{article.author.username}</span>
                        <span className="text-primary">{article.topic.name}</span>
                    </div>
                    <div className="space-y-4 leading-relaxed text-foreground">
                        {paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </article>

                <div className="space-y-5 border-t border-border pt-8">
                    <h2 className="text-xl font-bold text-foreground">
                        Commentaires ({article.comments.length})
                    </h2>

                    <CommentForm action={boundCommentAction}/>

                    {article.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Aucun commentaire pour l&apos;instant. Lance la discussion.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {article.comments.map((commentItem) => (
                                <li key={commentItem.id} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                                    {/* Mobile : pseudo au-dessus, bulle pleine largeur. À partir
                                        de `sm`, on retrouve la maquette : pseudo calé à droite +
                                        bulle à mi-largeur (les deux moitiés flex-1 alignent
                                        l'amorce de chaque commentaire). */}
                                    <span className="text-right text-sm font-medium text-foreground sm:flex-1 sm:pt-3">
                                        {commentItem.author.username}
                                    </span>
                                    <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground sm:flex-1">
                                        {commentItem.content}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}
