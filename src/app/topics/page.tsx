import Header from "@/src/app/components/header/Header";
import TopicCard from "@/src/app/components/topics/TopicCard";
import Button, {buttonVariants} from "@/src/app/components/ui/Button";
import {topicsService} from "@/src/lib/topics/topics.service";
import {subscribeAction} from "@/src/lib/subscriptions/subscribe.action";
import {cn} from "@/src/lib/utils";

/**
 * Page « Thèmes » : grille de tous les thèmes. Chaque carte propose de s'abonner
 * (`subscribeAction` via `.bind()`) ou affiche un état « Déjà abonné » inerte si
 * l'utilisateur y est déjà abonné. Le désabonnement se fait depuis le profil.
 */
export default async function TopicsPage() {
    const topics = await topicsService.getTopicsWithSubscription();

    return (
        <>
            <Header/>
            <section className="py-8">
                <h1 className="sr-only">Thèmes</h1>
                <div className="grid gap-4 sm:grid-cols-2">
                    {topics.map((topic) => (
                        <TopicCard
                            key={topic.id}
                            name={topic.name}
                            description={topic.description}
                            action={
                                topic.isSubscribed ? (
                                    <span className={cn(buttonVariants({variant: "muted", size: "sm"}), "cursor-default")}>
                                        Déjà abonné
                                    </span>
                                ) : (
                                    <form action={subscribeAction.bind(null, topic.id)}>
                                        <Button type="submit" size="sm">S&apos;abonner</Button>
                                    </form>
                                )
                            }
                        />
                    ))}
                </div>
            </section>
        </>
    );
}
