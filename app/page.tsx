"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import { LoadingSpinner } from "@/components/loading_spinner";

export default function HomePage()
{
    const { user, is_ready } = useAuth();
    const router = useRouter();

    useEffect(() =>
    {
        if (!is_ready)
        {
            return;
        }

        router.replace(user ? "/attendance" : "/login");
    }, [is_ready, user, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner label="Redirecting..." />
        </div>
    );
}
