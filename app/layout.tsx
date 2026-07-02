import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth_context";
import "./globals.css";

export const metadata: Metadata = {
    title: "ON 26 HR Portal",
    description: "HR portal for ON 26 attendance and recruitment",
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
