import Logo from "@/src/app/components/Logo";

export default function HeaderLogin() {
    return <header className="flex justify-center">
        <div className="bg-primary text-primary-foreground text-4xl font-bold px-8 py-4 rounded-2xl">
            <Logo/>
        </div>
    </header>
}