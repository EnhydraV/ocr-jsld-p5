import {prisma} from "@/prisma";
import {Prisma} from "@prisma/client";

export const usersRepository = {
    findByUsername: (username: string) => prisma.user.findUnique({where: {username}}),
    findByEmail: (email: string) => prisma.user.findUnique({where: {email}}),
    findByEmailOrUsername: (emailOrUsername: string) => prisma.user.findFirst({where: {OR: [{email: emailOrUsername}, {username: emailOrUsername}]}}),
    insert: (data: Prisma.UserCreateInput) => prisma.user.create({data}),
    update: (id: number, data: Prisma.UserUpdateInput) => prisma.user.update({data, where: {id}}),
}