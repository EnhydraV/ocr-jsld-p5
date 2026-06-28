import {expect, test} from "@playwright/test";

// Parcours non connecté : on repart d'un contexte sans session.
test.use({storageState: {cookies: [], origins: []}});

test.describe("public pages", () => {
    test("the home page offers login and register", async ({page}) => {
        await page.goto("/");
        await expect(page.getByRole("link", {name: "Se connecter"})).toBeVisible();
        await expect(page.getByRole("link", {name: "S'inscrire"})).toBeVisible();
    });

    test("the home page links to the login screen", async ({page}) => {
        await page.goto("/");
        await page.getByRole("link", {name: "Se connecter"}).click();
        await page.waitForURL("**/login");
        await expect(page.getByRole("heading", {name: "Se connecter"})).toBeVisible();
    });
});
