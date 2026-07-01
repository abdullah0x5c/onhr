"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { PORTFOLIOS } from "@/lib/constants";
import type { LoginSuccess, SessionUser } from "@/lib/types";

const SESSION_STORAGE_KEY = "nsvs_session";

type AuthContextValue = {
    user: SessionUser | null;
    is_ready: boolean;
    login: (email: string, login_data: LoginSuccess) => void;
    logout: () => void;
    set_selected_portfolio: (portfolio: string) => void;
    effective_portfolio: () => string | null;
    has_all_scope: () => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function read_session(): SessionUser | null
{
    if (typeof window === "undefined")
    {
        return null;
    }

    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw)
    {
        return null;
    }

    try
    {
        return JSON.parse(raw) as SessionUser;
    }
    catch
    {
        return null;
    }
}

function write_session(user: SessionUser | null): void
{
    if (typeof window === "undefined")
    {
        return;
    }

    if (!user)
    {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return;
    }

    // Prototype only: email is reused on every request without password re-check.
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode })
{
    const [user, set_user] = useState<SessionUser | null>(null);
    const [is_ready, set_is_ready] = useState(false);

    useEffect(() =>
    {
        set_user(read_session());
        set_is_ready(true);
    }, []);

    const login = useCallback((email: string, login_data: LoginSuccess) =>
    {
        const next_user: SessionUser = {
            email,
            name: login_data.name,
            designation: login_data.designation,
            home_portfolio: login_data.home_portfolio,
            allowed_portfolio: login_data.allowed_portfolio,
            selected_portfolio:
                login_data.allowed_portfolio === "all" ? PORTFOLIOS[0] : null,
        };

        set_user(next_user);
        write_session(next_user);
    }, []);

    const logout = useCallback(() =>
    {
        set_user(null);
        write_session(null);
    }, []);

    const set_selected_portfolio = useCallback((portfolio: string) =>
    {
        set_user((current) =>
        {
            if (!current || current.allowed_portfolio !== "all")
            {
                return current;
            }

            const next_user = { ...current, selected_portfolio: portfolio };
            write_session(next_user);
            return next_user;
        });
    }, []);

    const has_all_scope = useCallback(() =>
    {
        return user?.allowed_portfolio === "all";
    }, [user]);

    const effective_portfolio = useCallback(() =>
    {
        if (!user)
        {
            return null;
        }

        if (user.allowed_portfolio === "all")
        {
            return user.selected_portfolio;
        }

        return user.allowed_portfolio;
    }, [user]);

    const value = useMemo(
        () => ({
            user,
            is_ready,
            login,
            logout,
            set_selected_portfolio,
            effective_portfolio,
            has_all_scope,
        }),
        [
            user,
            is_ready,
            login,
            logout,
            set_selected_portfolio,
            effective_portfolio,
            has_all_scope,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue
{
    const context = useContext(AuthContext);
    if (!context)
    {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}
