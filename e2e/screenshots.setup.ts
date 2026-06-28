import {test as setup} from "@playwright/test";

// État de session dédié aux captures (distinct de celui des e2e), enregistré une
// fois puis réutilisé pour les pages connectées.
const STORAGE_STATE = "e2e/.auth/screenshots.json";

// Utilisateur de démonstration du seed (`prisma/seed.ts`), richement abonné :
// son fil et son profil sont peuplés. Identifiant = e-mail, mot de passe de démo.
const DEMO_USER = {login: "victor@mdd.dev", password: "Password1!"};

setup("authenticate (screenshots)", async ({page}) => {
    await page.goto("/login");
    await page.getByLabel("E-mail ou nom d'utilisateur").fill(DEMO_USER.login);
    await page.getByLabel("Mot de passe").fill(DEMO_USER.password);
    await page.getByRole("button", {name: "Se connecter"}).click();

    await page.waitForURL("**/feed");
    await page.context().storageState({path: STORAGE_STATE});
});
