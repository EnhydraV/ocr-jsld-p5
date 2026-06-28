import {expect, test} from "@playwright/test";
import {E2E_USER} from "./fixtures";

// Inscription et connexion partent d'un contexte sans session.
test.use({storageState: {cookies: [], origins: []}});

test.describe("authentication", () => {
    test("a visitor can register and is invited to log in", async ({page}) => {
        await page.goto("/register");
        await page.getByLabel("Nom d'utilisateur").fill("newbie_e2e");
        await page.getByLabel("Adresse e-mail").fill("newbie.e2e@mdd.dev");
        await page.getByLabel("Mot de passe").fill("Azerty#123");
        await page.getByRole("button", {name: "S'inscrire"}).click();

        await page.waitForURL(/\/login\?registered=1/);
        await expect(page.getByRole("status")).toContainText("Compte créé");
    });

    test("login rejects wrong credentials", async ({page}) => {
        await page.goto("/login");
        await page.getByLabel("E-mail ou nom d'utilisateur").fill(E2E_USER.email);
        await page.getByLabel("Mot de passe").fill("WrongPass#1");
        await page.getByRole("button", {name: "Se connecter"}).click();

        // Cible le message d'erreur (un autre `role="alert"`, le route-announcer
        // de Next, est présent en permanence : on évite de matcher les deux).
        await expect(page.getByText("Identifiant ou mot de passe incorrect.")).toBeVisible();
    });

    test("a seeded user can log in and reach the feed", async ({page}) => {
        await page.goto("/login");
        await page.getByLabel("E-mail ou nom d'utilisateur").fill(E2E_USER.email);
        await page.getByLabel("Mot de passe").fill(E2E_USER.password);
        await page.getByRole("button", {name: "Se connecter"}).click();

        await page.waitForURL("**/feed");
        await expect(page.getByRole("button", {name: "Se déconnecter"})).toBeVisible();
    });
});
