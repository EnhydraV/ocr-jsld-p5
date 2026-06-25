"use server";

import {revalidatePath} from "next/cache";
import {subscriptionsService} from "@/src/lib/subscriptions/subscriptions.service";

/**
 * Server Action : désabonne l'utilisateur connecté d'un thème, puis revalide les
 * vues qui dépendent des abonnements (`/topics`, `/feed`, `/profile`).
 * `topicId` est destiné à être passé via `unsubscribeAction.bind(null, topicId)`.
 * @param topicId - Id du thème ciblé.
 * @throws AppError 401 si aucune session valide (remonte à la frontière `error.tsx`).
 */
export async function unsubscribeAction(topicId: number): Promise<void> {
    await subscriptionsService.unsubscribeTopic(topicId);
    revalidatePath("/topics");
    revalidatePath("/feed");
    revalidatePath("/profile");
}
