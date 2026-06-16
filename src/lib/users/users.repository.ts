import {prisma} from "@/prisma";
import {Prisma} from "@prisma/client";

export const usersRepository = {
    findByUsername: (username: string) => prisma.user.findUnique({where: {username}}),
    findByEmail: (email: string) => prisma.user.findUnique({where: {email}}),
    insert: (data: Prisma.UserCreateInput) => prisma.user.create({data}),
    update: (id: number, data: Prisma.UserUpdateInput) => prisma.user.update({data, where: {id}}),
}