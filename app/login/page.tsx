"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { post_action } from "@/lib/api";
import { useAuth } from "@/context/auth_context";
import type { LoginSuccess } from "@/lib/types";
import { ErrorBanner } from "@/components/error_banner";

export default function LoginPage()
{
    const router = useRouter();
    const { login, user, is_ready } = useAuth();
    const [username, set_username] = useState("");
    const [password, set_password] = useState("");
    const [error_message, set_error_message] = useState("");
    const [is_submitting, set_is_submitting] = useState(false);

    useEffect(() =>
    {
        if (is_ready && user)
        {
            router.replace("/attendance");
        }
    }, [is_ready, user, router]);

    async function handle_submit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();
        set_error_message("");
        set_is_submitting(true);

        try
        {
            const response = await post_action<LoginSuccess>({
                action: "login",
                email: username,
                password,
            });

            login(username, response);
            router.push("/attendance");
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : "Login failed";
            set_error_message(message);
        }
        finally
        {
            set_is_submitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form
                onSubmit={handle_submit}
                className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
                <div>
                    <h1 className="text-2xl font-semibold">ON 26 HR Portal</h1>
                    <p className="mt-1 text-sm text-slate-600">Sign in with your username and password</p>
                </div>

                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Username</span>
                    <input
                        type="text"
                        data-testid="login-username"
                        className="rounded-md border border-slate-300 px-3 py-2"
                        value={username}
                        onChange={(event) => set_username(event.target.value)}
                        disabled={is_submitting}
                        required
                        autoComplete="username"
                        spellCheck={false}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Password</span>
                    <input
                        type="password"
                        data-testid="login-password"
                        className="rounded-md border border-slate-300 px-3 py-2"
                        value={password}
                        onChange={(event) => set_password(event.target.value)}
                        disabled={is_submitting}
                        required
                        autoComplete="current-password"
                    />
                </label>

                {error_message ? <ErrorBanner message={error_message} /> : null}

                <button
                    type="submit"
                    data-testid="login-submit"
                    disabled={is_submitting}
                    className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {is_submitting ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    );
}
