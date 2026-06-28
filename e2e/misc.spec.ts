import {expect, test} from "@playwright/test";

test.describe("navigation & robustness", () => {
    test("an unknown article shows the not-found page", async ({page}) => {
        await page.goto("/article/99999999");
        await expect(page.getByRole("heading", {name: "Page introuvable"})).toBeVisible();
    });

    test("a user can log out", async ({page}) => {
        await page.goto("/feed");
        await page.getByRole("button", {name: "Se déconnecter"}).click();

        // Déconnexion → retour à l'accueil non connecté.
        await expect(page.getByRole("link", {name: "Se connecter"})).toBeVisible();
    });

    test.describe("mobile", () => {
        test.use({viewport: {width: 390, height: 844}});

        test("the burger menu reveals the navigation", async ({page}) => {
            await page.goto("/feed");
            await page.getByRole("button", {name: "Ouvrir le menu"}).click();
            await expect(page.getByRole("link", {name: "Thèmes"})).toBeVisible();
        });
    });
});
