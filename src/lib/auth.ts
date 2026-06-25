import {AuthOptions, getServerSession} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {usersService} from "@/src/lib/users/users.service";
import {AppError} from "@/src/errors/AppError";

/**
 * Configuration NextAuth : provider Credentials (email/username + mot de passe),
 * stratégie JWT, et propagation de l'id Prisma jusque dans la session.
 */
export const authOptions : AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Email & Mot de passe",
            credentials: {
                email: { label: "Email ou Nom d'utilisateur", type: "text", placeholder: "user@example.com ou bestdevever18" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                if(credentials===undefined){
                    throw new AppError(401,"Authentication required");
                }
                const user= await usersService.findByEmailOrUsername(credentials.email);
                if(!user){
                    throw new AppError(401,"Wrong username/email or password");
                }
                if(!await bcrypt.compare(credentials.password,user.password)){
                    throw new AppError(401,"Wrong username/email or password");
                }
                // NextAuth attend un id de type string ; l'id Prisma est un Int
                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.username,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
    },
    secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Récupère l'id de l'utilisateur connecté côté serveur, source d'identité
 * de confiance pour les services (jamais de paramètre client).
 * @returns L'id Prisma (Int) de l'utilisateur.
 * @throws AppError 401 si aucune session valide.
 */
export async function getCurrentUserId(): Promise<number> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AppError(401, "Authentication required");
    return Number(session.user.id);
}
