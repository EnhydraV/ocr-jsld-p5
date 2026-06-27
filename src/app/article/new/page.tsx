import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import Header from "@/src/app/components/header/Header";
import ArticleForm from "./ArticleForm";
import {topicsService} from "@/src/lib/topics/topics.service";

/**
 * Page de rédaction d'un article. Server Component : charge la liste des thèmes
 * (pour le menu déroulant) et délègue la saisie au formulaire client
 * `ArticleForm`, qui pilote `postAction` via `useActionState`. La redirection
 * vers le détail de l'article créé est gérée par l'action elle-même.
 */

// Rendu dynamique forcé : page authentifiée lisant les thèmes en base. Sans ça,
// `next build` tente de la prérendre statiquement et échoue (base injoignable au
// build). Contrairement aux autres pages, elle ne lit pas la session côté page,
// donc Next ne la bascule pas en dynamique automatiquement.
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
    const topics = await topicsService.getAllTopics();

    return (
        <>
            <Header/>
            <section className="mx-auto max-w-180 space-y-8 py-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/feed"
                            aria-label="Retour au fil"
                            className="inline-flex items-center text-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="size-8" aria-hidden/>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Créer un article</h1>
                    </div>
                    <p className="text-sm text-foreground">
                        Rédige et publie un article dans l&apos;un des thèmes disponibles.
                    </p>
                </div>

                <ArticleForm topics={topics}/>
            </section>
        </>
    );
}
