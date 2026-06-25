"use server";

import {revalidatePath} from "next/cache";
import {subscriptionsService} from "@/src/lib/subscriptions/subscriptions.service";

/**
 * Server Action : abonne l'utilisateur connecté à un thème, puis revalide les
 * vues qui dépendent des abonnements (`/topics`, `/feed`, `/profile`).
 * `topicId` est destiné à être passé via `subscribeAction.bind(null, topicId)`.
 * @param topicId - Id du thème ciblé.
 * @throws AppError 401 si aucune session valide (remonte à la frontière `error.tsx`).
 */
export async function subscribeAction(topicId: number): Promise<void> {
    await subscriptionsService.subscribeTopic(topicId);
    revalidatePath("/topics");
    revalidatePath("/feed");
    revalidatePath("/profile");
}
