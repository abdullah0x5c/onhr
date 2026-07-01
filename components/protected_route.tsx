"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import { LoadingSpinner } from "@/components/loading_spinner";

export function ProtectedRoute({ children }: { children: ReactNode })
{
    const { user, is_ready } = useAuth();
    const router = useRouter();

    useEffect(() =>
    {
        if (is_ready && !user)
        {
            router.replace("/login");
        }
    }, [is_ready, user, router]);

    if (!is_ready)
    {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner label="Loading session..." />
            </div>
        );
    }

    if (!user)
    {
        return null;
    }

    return <>{children}</>;
}
