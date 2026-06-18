import {DefaultSession} from "next-auth";

// Augmentation des types NextAuth pour exposer l'id utilisateur
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}
