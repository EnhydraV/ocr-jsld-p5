import {expect, test as setup} from "@playwright/test";
import {E2E_USER, STORAGE_STATE} from "./fixtures";

// Projet `setup` : se connecte une fois via l'UI et enregistre l'état de session
// (cookie NextAuth) dans un fichier, réutilisé par tous les scénarios authentifiés.
setup("authenticate", async ({page}) => {
    await page.goto("/login");
    await page.getByLabel("E-mail ou nom d'utilisateur").fill(E2E_USER.email);
    await page.getByLabel("Mot de passe").fill(E2E_USER.password);
    await page.getByRole("button", {name: "Se connecter"}).click();

    // La connexion réussie route vers le fil et affiche la nav connectée.
    await page.waitForURL("**/feed");
    await expect(page.getByRole("button", {name: "Se déconnecter"})).toBeVisible();

    await page.context().storageState({path: STORAGE_STATE});
});
