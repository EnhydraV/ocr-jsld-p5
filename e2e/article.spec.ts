import {expect, test} from "@playwright/test";
import {ARTICLES, TOPICS} from "./fixtures";

test.describe("articles", () => {
    test("a user can publish an article", async ({page}) => {
        await page.goto("/article/new");

        // Le formulaire d'article n'a pas de label visible : on cible par placeholder.
        await page.locator('select[name="topicId"]').selectOption({label: TOPICS.subscribed});
        await page.getByPlaceholder("Titre de l'article").fill("Mon article de test e2e");
        await page
            .getByPlaceholder("Contenu de l'article")
            .fill("Ceci est un contenu d'article suffisamment long pour passer la validation des cinquante caractères.");
        await page.getByRole("button", {name: "Créer"}).click();

        await page.waitForURL(/\/article\/\d+\?created=1/);
        await expect(page.getByRole("status")).toContainText("Article publié");
        await expect(page.getByRole("heading", {name: "Mon article de test e2e"})).toBeVisible();
    });

    test("a user can comment an existing article", async ({page}) => {
        await page.goto("/feed");
        await page.getByRole("link", {name: ARTICLES.older}).click();
        await page.waitForURL(/\/article\/\d+/);

        await page.getByLabel("Ajouter un commentaire").fill("Super article, merci pour le partage !");
        await page.getByRole("button", {name: "Publier le commentaire"}).click();

        await page.waitForURL(/\/article\/\d+\?comment=1/);
        await expect(page.getByRole("status")).toContainText("Commentaire ajouté");
        await expect(page.getByText("Super article, merci pour le partage !")).toBeVisible();
    });
});
