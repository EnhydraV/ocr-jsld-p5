import {usersRepository} from './users.repository';
import {RegisterSchema} from "@/src/lib/users/users.dto";
import {AppError} from "@/src/errors/AppError";
import bcrypt from "bcrypt";

class UsersService {
    constructor(private repo = usersRepository) {
    }

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

    async findByEmail(email: string) {
        return this.repo.findByEmail(email);
    }

    async findByUsername(username: string) {
        return this.repo.findByUsername(username);
    }

    async findByEmailOrUsername(usernameOrEmail: string) {
        return this.repo.findByEmailOrUsername(usernameOrEmail);
    }

    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }
}

export const usersService = new UsersService();