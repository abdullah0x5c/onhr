"use client";

import { useState } from "react";
import { post_action } from "@/lib/api";
import type { ApplicantByCmsResponse } from "@/lib/types";
import { ErrorBanner } from "@/components/error_banner";

type CmsSearchProps = {
    email: string;
    on_applicant_found: (cms_id: string) => void;
};

export function CmsSearch({ email, on_applicant_found }: CmsSearchProps)
{
    const [cms_id, set_cms_id] = useState("");
    const [error_message, set_error_message] = useState("");
    const [is_searching, set_is_searching] = useState(false);

    async function handle_search(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();
        set_error_message("");
        set_is_searching(true);

        try
        {
            await post_action<ApplicantByCmsResponse>({
                action: "get_applicant_by_cms",
                email,
                cms_id,
            });

            on_applicant_found(cms_id);
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : "Lookup failed";
            set_error_message(
                `${message}. Try the applicant list below or search by name there if the CMS ID may be stored incorrectly.`,
            );
        }
        finally
        {
            set_is_searching(false);
        }
    }

    return (
        <form onSubmit={handle_search} className="space-y-3 rounded-md border border-slate-200 bg-white p-4" data-testid="cms-search-form">
            <h3 className="text-base font-semibold">CMS ID lookup</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    data-testid="cms-search-input"
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2"
                    placeholder="Enter CMS ID"
                    value={cms_id}
                    onChange={(event) => set_cms_id(event.target.value)}
                    disabled={is_searching}
                    required
                />
                <button
                    type="submit"
                    data-testid="cms-search-submit"
                    disabled={is_searching}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {is_searching ? "Searching..." : "Search"}
                </button>
            </div>
            {error_message ? <ErrorBanner message={error_message} /> : null}
        </form>
    );
}
