import {beforeEach, describe, expect, it, vi} from "vitest";
import {revalidatePath} from "next/cache";
import {profileAction, type ProfileState} from "@/src/lib/users/profile.action";
import {usersService} from "@/src/lib/users/users.service";
import {AppError} from "@/src/errors/AppError";

vi.mock("next/cache", () => ({revalidatePath: vi.fn()}));
vi.mock("@/src/lib/users/users.service", () => ({
    usersService: {updateProfile: vi.fn()},
}));

const EMPTY: ProfileState = {};

function formData(fields: Record<string, string>) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) fd.set(key, value);
    return fd;
}

describe("profileAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should update, revalidate the profile and return a success state (no redirect)", async () => {
        vi.mocked(usersService.updateProfile).mockResolvedValue({} as never);

        const state = await profileAction(EMPTY, formData({username: "juliette", email: "juliette@mdd.dev", password: ""}));

        expect(usersService.updateProfile).toHaveBeenCalledWith({username: "juliette", email: "juliette@mdd.dev", password: ""});
        expect(revalidatePath).toHaveBeenCalledWith("/profile");
        expect(state).toEqual({success: true, values: {username: "juliette", email: "juliette@mdd.dev"}});
    });

    it("should return the error state and not revalidate on failure", async () => {
        vi.mocked(usersService.updateProfile).mockRejectedValue(new AppError(409, "Ce nom d'utilisateur existe déjà"));

        const state = await profileAction(EMPTY, formData({username: "juliette", email: "juliette@mdd.dev", password: ""}));

        expect(state).toEqual({error: "Ce nom d'utilisateur existe déjà", values: {username: "juliette", email: "juliette@mdd.dev"}});
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});
