import {prisma} from "@/prisma";
import {Prisma} from "@prisma/client";

/**
 * Accès aux utilisateurs en base. Les lectures renvoient l'entité complète
 * (mot de passe haché compris) : c'est au service de filtrer ce qui sort.
 */
export const usersRepository = {
    /** Recherche par nom d'utilisateur (unique). */
    findByUsername: (username: string) => prisma.user.findUnique({where: {username}}),

    /** Recherche par email (unique). */
    findByEmail: (email: string) => prisma.user.findUnique({where: {email}}),

    /** Recherche par email OU nom d'utilisateur (pour la connexion). */
    findByEmailOrUsername: (emailOrUsername: string) => prisma.user.findFirst({where: {OR: [{email: emailOrUsername}, {username: emailOrUsername}]}}),

    /** Crée un utilisateur. */
    insert: (data: Prisma.UserCreateInput) => prisma.user.create({data}),

    /** Met à jour un utilisateur existant. */
    update: (id: number, data: Prisma.UserUpdateInput) => prisma.user.update({data, where: {id}}),
}