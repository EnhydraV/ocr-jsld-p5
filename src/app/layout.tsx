import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MDD - Monde de Dév",
    description: "Réseau social pour développeurs",
};

/**
 * Layout racine de l'application : déclare la langue (`fr`), les polices Geist
 * et le conteneur centré (`max-w-200`) commun à toutes les pages.
 * @param children - Le contenu de la page rendue.
 */
export default function RootLayout(
    {children}: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <main className="max-w-200 mx-auto px-4">
            {children}
        </main>
        </body>
        </html>
    );
}
