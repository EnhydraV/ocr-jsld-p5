import NextAuth from 'next-auth';
import {authOptions} from "@/src/lib/auth";

/**
 * Route catch-all NextAuth (`/api/auth/*`) : connexion, déconnexion, callbacks,
 * session. Le même handler répond en GET et en POST, à partir de la config
 * partagée dans `auth.ts`.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };