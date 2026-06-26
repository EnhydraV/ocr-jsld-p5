import Link from "next/link";
import type {Prisma} from "@prisma/client";
import Header from "@/src/app/components/header/Header";
import ArticleCard from "@/src/app/components/articles/ArticleCard";
import {buttonVariants} from "@/src/app/components/ui/Button";
import {articlesService} from "@/src/lib/articles/articles.service";

type FeedPageProps = {
    // En Next 16, les searchParams d'un Server Component sont asynchrones.
    searchParams: Promise<{order?: string}>;
};

/**
 * Fil d'actualité : articles des thèmes suivis par l'utilisateur connecté.
 * Tri par date configurable via `?order=asc|desc` (défaut `desc`, plus récents
 * d'abord). Barre du haut : créer un article + bascule de tri.
 */
export default async function Feed({searchParams}: FeedPageProps) {
    const {order} = await searchParams;
    const sortOrder: Prisma.SortOrder = order === "asc" ? "asc" : "desc";
    const nextOrder = sortOrder === "desc" ? "asc" : "desc";

    const articles = await articlesService.getFeedArticles(sortOrder);

    return (
        <>
            <Header/>
            <section className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/article/new" className={buttonVariants({size: "sm"})}>
                        Créer un article
                    </Link>
                    <Link
                        href={`/feed?order=${nextOrder}`}
                        className="inline-flex items-center gap-1 text-sm text-foreground transition-colors hover:text-primary"
                    >
                        Trier par {sortOrder === "desc" ? "↓" : "↑"}
                    </Link>
                </div>

                {articles.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                        Aucun article pour l&apos;instant. Abonne-toi à des thèmes pour remplir ton fil.{" "}
                        <Link className="underline" href="/topics">Voir les thèmes</Link>
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                id={article.id}
                                title={article.title}
                                authorName={article.author.username}
                                createdAt={article.createdAt}
                                content={article.content}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
