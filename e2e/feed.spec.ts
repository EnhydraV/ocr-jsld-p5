import {expect, test} from "@playwright/test";
import {ARTICLES} from "./fixtures";

test.describe("feed", () => {
    test("lists the articles of subscribed topics", async ({page}) => {
        await page.goto("/feed");
        await expect(page.getByRole("heading", {name: ARTICLES.newer})).toBeVisible();
        await expect(page.getByRole("heading", {name: ARTICLES.older})).toBeVisible();
    });

    test("sorting flips the order of the feed", async ({page}) => {
        // Ordre RELATIF des deux articles semés (robuste aux articles créés par
        // d'autres scénarios) : en desc le plus récent précède le plus ancien.
        await page.goto("/feed?order=desc");
        const desc = await page.getByRole("heading", {level: 2}).allTextContents();
        expect(desc.indexOf(ARTICLES.newer)).toBeLessThan(desc.indexOf(ARTICLES.older));

        // En asc, l'inverse.
        await page.goto("/feed?order=asc");
        const asc = await page.getByRole("heading", {level: 2}).allTextContents();
        expect(asc.indexOf(ARTICLES.older)).toBeLessThan(asc.indexOf(ARTICLES.newer));
    });
});
