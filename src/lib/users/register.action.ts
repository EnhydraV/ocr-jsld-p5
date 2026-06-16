"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { usersService } from "@/src/lib/users/users.service";
import { AppError } from "@/src/errors/AppError";

export type RegisterState = {
    error?: string;
    values?: { username: string; email: string };
};

export async function registerAction(
    _prev: RegisterState,
    formData: FormData,
): Promise<RegisterState> {
    // Saisies conservées pour re-remplir le formulaire en cas d'échec
    const values = {
        username: String(formData.get("username") ?? ""),
        email: String(formData.get("email") ?? ""),
    };

    try {
        await usersService.register({
            ...values,
            password: String(formData.get("password") ?? ""),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message, values };
        }
        if (error instanceof AppError) {
            return { error: error.message, values };
        }
        console.error("registerAction:", error);
        return { error: "Une erreur interne est survenue. Réessaie plus tard.", values };
    }

    redirect("/login?registered=1");
}
