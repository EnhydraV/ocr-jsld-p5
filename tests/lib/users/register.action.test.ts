import {beforeEach, describe, expect, it, vi} from "vitest";
import {redirect} from "next/navigation";
import {registerAction, type RegisterState} from "@/src/lib/users/register.action";
import {usersService} from "@/src/lib/users/users.service";
import {AppError} from "@/src/errors/AppError";

vi.mock("next/navigation", () => ({redirect: vi.fn()}));
vi.mock("@/src/lib/users/users.service", () => ({
    usersService: {register: vi.fn()},
}));

const EMPTY: RegisterState = {};

function formData(fields: Record<string, string>) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) fd.set(key, value);
    return fd;
}

describe("registerAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should register then redirect to the login page", async () => {
        vi.mocked(usersService.register).mockResolvedValue({} as never);

        await registerAction(EMPTY, formData({username: "victor", email: "victor@mdd.dev", password: "Azerty#123"}));

        expect(usersService.register).toHaveBeenCalledWith({
            username: "victor",
            email: "victor@mdd.dev",
            password: "Azerty#123",
        });
        expect(redirect).toHaveBeenCalledWith("/login?registered=1");
    });

    it("should return the AppError message and keep the typed-in values on conflict", async () => {
        vi.mocked(usersService.register).mockRejectedValue(new AppError(409, "Cette adresse email existe déjà"));

        const state = await registerAction(EMPTY, formData({username: "victor", email: "victor@mdd.dev", password: "Azerty#123"}));

        expect(state).toEqual({error: "Cette adresse email existe déjà", values: {username: "victor", email: "victor@mdd.dev"}});
        expect(redirect).not.toHaveBeenCalled();
    });
});
