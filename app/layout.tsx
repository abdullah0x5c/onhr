import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth_context";
import "./globals.css";

export const metadata: Metadata = {
    title: "NSVS HR Portal",
    description: "HR portal for NSVS attendance and recruitment",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>)
{
    return (
        <html lang="en">
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
