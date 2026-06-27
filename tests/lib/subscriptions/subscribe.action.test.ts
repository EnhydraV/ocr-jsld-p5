import {beforeEach, describe, expect, it, vi} from "vitest";
import {revalidatePath} from "next/cache";
import {subscribeAction} from "@/src/lib/subscriptions/subscribe.action";
import {subscriptionsService} from "@/src/lib/subscriptions/subscriptions.service";

vi.mock("next/cache", () => ({revalidatePath: vi.fn()}));
vi.mock("@/src/lib/subscriptions/subscriptions.service", () => ({
    subscriptionsService: {subscribeTopic: vi.fn()},
}));

const TOPIC_ID = 5;

describe("subscribeAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should subscribe then revalidate the dependent views", async () => {
        await subscribeAction(TOPIC_ID);

        expect(subscriptionsService.subscribeTopic).toHaveBeenCalledWith(TOPIC_ID);
        expect(revalidatePath).toHaveBeenCalledWith("/topics");
        expect(revalidatePath).toHaveBeenCalledWith("/feed");
        expect(revalidatePath).toHaveBeenCalledWith("/profile");
    });
});
