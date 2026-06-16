import Link from "next/link";
import HeaderHome from "@/src/app/components/HeaderHome";

export default function Home() {
    return (

        <>
            <HeaderHome/>

            <div className="flex gap-4">
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Se connecter
                </Link>
                <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    S&apos;inscrire
                </Link>
            </div>
        </>
    );
}
