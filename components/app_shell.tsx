"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import { is_director_role } from "@/lib/api";

function nav_link_class(is_active: boolean): string
{
    const base = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
    if (is_active)
    {
        return `${base} bg-slate-900 text-white`;
    }

    return `${base} text-slate-700 hover:bg-slate-100`;
}

export function AppShell({ children }: { children: React.ReactNode })
{
    const pathname = usePathname();
    const { user, logout, effective_portfolio } = useAuth();

    if (!user)
    {
        return <>{children}</>;
    }

    const portfolio_label = effective_portfolio() ?? "—";
    const show_recruitment = is_director_role(user.designation);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-lg font-semibold">NSVS HR Portal</p>
                        <p className="text-sm text-slate-600">
                            {user.name} · {user.designation} · {portfolio_label}
                        </p>
                    </div>

                    <nav className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/attendance"
                            className={nav_link_class(pathname === "/attendance")}
                        >
                            Attendance
                        </Link>
                        {show_recruitment ? (
                            <Link
                                href="/recruitment"
                                className={nav_link_class(pathname === "/recruitment")}
                            >
                                Recruitment
                            </Link>
                        ) : null}
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}
