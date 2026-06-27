import {beforeEach, describe, expect, it, vi} from "vitest";
import {revalidatePath} from "next/cache";
import {unsubscribeAction} from "@/src/lib/subscriptions/unsubscribe.action";
import {subscriptionsService} from "@/src/lib/subscriptions/subscriptions.service";

vi.mock("next/cache", () => ({revalidatePath: vi.fn()}));
vi.mock("@/src/lib/subscriptions/subscriptions.service", () => ({
    subscriptionsService: {unsubscribeTopic: vi.fn()},
}));

const TOPIC_ID = 5;

describe("unsubscribeAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should unsubscribe then revalidate the dependent views", async () => {
        await unsubscribeAction(TOPIC_ID);

        expect(subscriptionsService.unsubscribeTopic).toHaveBeenCalledWith(TOPIC_ID);
        expect(revalidatePath).toHaveBeenCalledWith("/topics");
        expect(revalidatePath).toHaveBeenCalledWith("/feed");
        expect(revalidatePath).toHaveBeenCalledWith("/profile");
    });
});
