import {usersRepository} from './users.repository';
import {RegisterSchema} from "@/src/lib/users/users.dto";
import {AppError} from "@/src/errors/AppError";
import bcrypt from "bcrypt";

class UsersService {
    constructor(private repo = usersRepository) {
    }

    async register(input: unknown) {
        const user = RegisterSchema.parse(input);

        if (await this.repo.findByEmail(user.email) !== null) {
            throw new AppError(409, "Cette adresse email existe déjà");
        }
        if (await this.repo.findByUsername(user.username) !== null) {
            throw new AppError(40, "Ce nom d'utilisateur existe déjà");
        }

        return this.repo.insert({...user, password: this.hashPassword(user.password)});
    }

    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }
}

export const usersService = new UsersService();