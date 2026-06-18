import LogoutButton from "@/src/app/components/LogoutButton";

export default function Header() {
    return <>
        <div className="flex justify-center">
            <div className="bg-primary text-primary-foreground text-4xl font-bold px-8 py-4 rounded-2xl">
                MDD
            </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground">
            Monde de Dév
        </h1>

        <nav>
            <LogoutButton/>
        </nav>
    </>
}