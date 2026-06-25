import Header from "@/src/app/components/header/Header";
import ProfileForm from "@/src/app/components/forms/ProfileForm";
import TopicCard from "@/src/app/components/topics/TopicCard";
import Button from "@/src/app/components/ui/Button";
import {usersService} from "@/src/lib/users/users.service";
import {topicsService} from "@/src/lib/topics/topics.service";
import {unsubscribeAction} from "@/src/lib/subscriptions/unsubscribe.action";
import Link from "next/link";

/**
 * Page « Profil utilisateur » : formulaire d'édition (username, e-mail, mot de
 * passe optionnel) mutualisé avec l'inscription via `AccountForm`, suivi de la
 * liste des thèmes suivis avec désabonnement. Server Component ; seul le
 * formulaire (interactif) est isolé côté client dans `ProfileForm`.
 */
export default async function ProfilePage() {
    const [user, subscribedTopics] = await Promise.all([
        usersService.getCurrentUser(),
        topicsService.getSubscribedTopics(),
    ]);

    return (
        <>
            <Header/>
            <section className="space-y-10 py-8">
                <div className="mx-auto max-w-110">
                    <ProfileForm
                        initialValues={{username: user?.username ?? "", email: user?.email ?? ""}}
                    />
                </div>

                <div className="space-y-4 border-t border-border pt-8">
                    <h2 className="text-center text-2xl font-bold text-foreground">Abonnements</h2>
                    {subscribedTopics.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">
                            Tu n&apos;es abonné à aucun thème pour l&apos;instant.{' '}
                            <Link className="underline" href="/topics">Voir les thèmes</Link>
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {subscribedTopics.map((topic) => (
                                <TopicCard
                                    key={topic.id}
                                    name={topic.name}
                                    description={topic.description}
                                    action={
                                        <form action={unsubscribeAction.bind(null, topic.id)}>
                                            <Button type="submit" size="sm">Se désabonner</Button>
                                        </form>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
