import Logo from "@/src/app/components/header/Logo";

// Header de l'accueil non connecté : grand logo centré.
export default function HeaderHome() {
    return (
        <header className="flex justify-center">
            <Logo className="w-56 sm:w-64" priority/>
        </header>
    );
}
