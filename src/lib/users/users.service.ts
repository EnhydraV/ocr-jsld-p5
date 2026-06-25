import {usersRepository} from './users.repository';
import {RegisterSchema} from "@/src/lib/users/users.dto";
import {AppError} from "@/src/errors/AppError";
import bcrypt from "bcrypt";

/**
 * Service des utilisateurs : validation des entrées, règles d'unicité et
 * hachage du mot de passe avant toute écriture en base.
 */
class UsersService {
    constructor(private repo = usersRepository) {
    }

    /**
     * Inscrit un nouvel utilisateur : valide l'entrée (Zod), vérifie l'unicité
     * de l'email et du nom d'utilisateur, puis enregistre le mot de passe haché.
     * @param input - Données brutes du formulaire, validées par RegisterSchema.
     * @throws AppError 409 si l'email ou le nom d'utilisateur est déjà pris.
     */
    async register(input: unknown) {
        const user = RegisterSchema.parse(input);

        if (await this.findByEmail(user.email) !== null) {
            throw new AppError(409, "Cette adresse email existe déjà");
        }
        if (await this.findByUsername(user.username) !== null) {
            throw new AppError(409, "Ce nom d'utilisateur existe déjà");
        }

        return this.repo.insert({...user, password: this.hashPassword(user.password)});
    }

    /** Recherche un utilisateur par email. */
    async findByEmail(email: string) {
        return this.repo.findByEmail(email);
    }

    /** Recherche un utilisateur par nom d'utilisateur. */
    async findByUsername(username: string) {
        return this.repo.findByUsername(username);
    }

    /** Recherche un utilisateur par email ou nom d'utilisateur (connexion). */
    async findByEmailOrUsername(usernameOrEmail: string) {
        return this.repo.findByEmailOrUsername(usernameOrEmail);
    }

    /** Hache un mot de passe en clair (bcrypt, 10 tours). */
    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }
}

export const usersService = new UsersService();