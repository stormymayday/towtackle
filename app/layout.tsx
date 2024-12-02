import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "TowTackle - Roadside Assistance Made Easy",
        template: "%s | TowTackle",
    },
    description:
        "TowTackle connects drivers, clients, and service providers with seamless roadside assistance and incident management.",
    keywords: [
        "towing",
        "roadside assistance",
        "vehicle recovery",
        "incident management",
    ],
    openGraph: {
        title: "TowTackle",
        description: "Streamline Towing and Incident Management",
        images: [{ url: "/hero-image.jpg" }],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
