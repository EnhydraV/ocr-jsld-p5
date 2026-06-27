import {getToken} from "next-auth/jwt";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

// Pages publiques : accessibles sans authentification.
const PUBLIC_PATHS = ["/", "/login", "/register"];

/**
 * Videur d'authentification. Redirige les utilisateurs connectés hors des
 * pages publiques. Pour les pages privées sans session : redirige vers le login
 * (navigation GET) ou renvoie une 401 (mutations, ex. server actions POST).
 * Garde grossière (connecté ou non) : le contrôle fin reste dans les services.
 * @param req - Requête entrante interceptée par Next.
 */
export async function proxy(req: NextRequest) {
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const isPublic = PUBLIC_PATHS.includes(req.nextUrl.pathname);

    // Pages publiques : on renvoie l'utilisateur déjà connecté vers son fil.
    if (isPublic) {
        if (token) {
            return NextResponse.redirect(new URL("/feed", req.url));
        }
        return NextResponse.next();
    }

    // Toute autre route : authentification obligatoire.
    if (!token) {
        // Les server actions (POST) doivent recevoir une vraie 401 : une redirection
        // serait suivie par le client et renverrait le HTML du login comme résultat.
        if (req.method !== "GET") {
            return new NextResponse("Unauthorized", {status: 401});
        }
        // Navigation classique : on envoie l'utilisateur se connecter, en gardant
        // la destination voulue (chemin + query) pour y revenir après connexion.
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Le proxy s'exécute sur toutes les routes SAUF l'API NextAuth (sinon la requête de connexion elle-même serait bloquée),
// les assets internes de Next et `logo.png`. Ce dernier est le SEUL fichier de `public/` exclu, car il s'affiche sur la
// home déconnectée : sinon la requête non authentifiée serait redirigée vers le login et `next/image` recevrait du HTML
// au lieu de l'image. Les autres médias de `public/` (ex. futures images d'articles) restent volontairement derrière le
// videur pour être protégés par l'authentification.
export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|logo\\.png).*)"],
};
