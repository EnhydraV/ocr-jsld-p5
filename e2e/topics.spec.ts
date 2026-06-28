import {expect, test} from "@playwright/test";
import {TOPICS} from "./fixtures";

test.describe("topics", () => {
    test("subscribing flips the button to « Déjà abonné »", async ({page}) => {
        await page.goto("/topics");

        // Carte du thème non suivi, ciblée par son titre exact.
        const card = page
            .getByRole("article")
            .filter({has: page.getByRole("heading", {name: TOPICS.toSubscribe, exact: true})});

        await card.getByRole("button", {name: "S'abonner"}).click();

        // Après revalidation, le bouton laisse place à l'état inerte « Déjà abonné ».
        await expect(card.getByText("Déjà abonné")).toBeVisible();
    });
});
