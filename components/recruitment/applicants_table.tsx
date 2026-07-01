"use client";

import { useMemo, useState } from "react";
import { extract_cms_id } from "@/lib/api";
import type { Applicant } from "@/lib/types";

type ApplicantsTableProps = {
    applicants: Applicant[];
    on_select: (cms_id: string) => void;
    selected_cms_id: string | null;
};

export function ApplicantsTable({
    applicants,
    on_select,
    selected_cms_id,
}: ApplicantsTableProps)
{
    const [query, set_query] = useState("");

    const filtered_applicants = useMemo(() =>
    {
        const normalized_query = query.trim().toLowerCase();
        if (!normalized_query)
        {
            return applicants;
        }

        return applicants.filter((applicant) =>
        {
            const name = String(applicant.Name ?? "").toLowerCase();
            const cms_id = extract_cms_id(applicant["Registration Number"]).toLowerCase();
            return name.includes(normalized_query) || cms_id.includes(normalized_query);
        });
    }, [applicants, query]);

    if (applicants.length === 0)
    {
        return (
            <p className="text-sm text-slate-600">No applicants found for this portfolio.</p>
        );
    }

    return (
        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-semibold">Applicants</h3>
                <input
                    type="search"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
                    placeholder="Search by name or CMS ID"
                    value={query}
                    onChange={(event) => set_query(event.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">CMS ID</th>
                            <th className="px-4 py-3 font-medium">1st preference</th>
                            <th className="px-4 py-3 font-medium">2nd preference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered_applicants.map((applicant) =>
                        {
                            const cms_id = extract_cms_id(applicant["Registration Number"]);
                            const is_selected = selected_cms_id === cms_id;

                            return (
                                <tr
                                    key={`${cms_id}-${String(applicant.Name)}`}
                                    className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                                        is_selected ? "bg-slate-100" : ""
                                    }`}
                                    onClick={() =>
                                    {
                                        if (cms_id)
                                        {
                                            on_select(cms_id);
                                        }
                                    }}
                                >
                                    <td className="px-4 py-3">{String(applicant.Name ?? "")}</td>
                                    <td className="px-4 py-3">{cms_id || "—"}</td>
                                    <td className="px-4 py-3">
                                        {String(applicant["1st preference"] ?? "")}
                                    </td>
                                    <td className="px-4 py-3">
                                        {String(applicant["2nd preference"] ?? "")}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered_applicants.length === 0 ? (
                <p className="text-sm text-slate-600">No applicants match your search.</p>
            ) : null}
        </div>
    );
}
