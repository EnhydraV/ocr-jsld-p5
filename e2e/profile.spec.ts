import {expect, test} from "@playwright/test";
import {TOPICS} from "./fixtures";

test.describe("profile", () => {
    test("a user can update their profile", async ({page}) => {
        await page.goto("/profile");

        await page.getByLabel("Nom d'utilisateur").fill("victor_renamed");
        await page.getByRole("button", {name: "Sauvegarder"}).click();

        await expect(page.getByRole("status")).toContainText("Profil mis à jour");
    });

    test("a user can unsubscribe from a topic", async ({page}) => {
        await page.goto("/profile");

        // Carte du thème suivi (sans article), dans la section « Abonnements ».
        const card = page
            .getByRole("article")
            .filter({has: page.getByRole("heading", {name: TOPICS.toUnsubscribe, exact: true})});
        await card.getByRole("button", {name: "Se désabonner"}).click();

        // Après revalidation, le thème disparaît de la liste des abonnements.
        await expect(
            page.getByRole("heading", {name: TOPICS.toUnsubscribe, exact: true}),
        ).toHaveCount(0);
    });
});
