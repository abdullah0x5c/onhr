"use client";

import { PORTFOLIOS } from "@/lib/constants";
import { useAuth } from "@/context/auth_context";

export function PortfolioPicker()
{
    const { user, set_selected_portfolio } = useAuth();

    if (!user || user.allowed_portfolio !== "all")
    {
        return null;
    }

    return (
        <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-medium">Portfolio</span>
            <select
                data-testid="portfolio-picker"
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
                value={user.selected_portfolio ?? PORTFOLIOS[0]}
                onChange={(event) => set_selected_portfolio(event.target.value)}
            >
                {PORTFOLIOS.map((portfolio) => (
                    <option key={portfolio} value={portfolio}>
                        {portfolio}
                    </option>
                ))}
            </select>
        </label>
    );
}
