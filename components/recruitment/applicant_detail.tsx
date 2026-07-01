"use client";

import type { Applicant } from "@/lib/types";

type ApplicantDetailProps = {
    applicant: Applicant;
    portfolio: string;
};

function matched_preference(applicant: Applicant, portfolio: string): string | null
{
    const first = String(applicant["1st preference"] ?? "");
    const second = String(applicant["2nd preference"] ?? "");

    if (first === portfolio)
    {
        return "1st preference";
    }

    if (second === portfolio)
    {
        return "2nd preference";
    }

    return null;
}

export function ApplicantDetail({ applicant, portfolio }: ApplicantDetailProps)
{
    const preference_match = matched_preference(applicant, portfolio);
    const entries = Object.entries(applicant);

    return (
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
            <div>
                <h3 className="text-lg font-semibold">
                    {String(applicant.Name ?? "Applicant")}
                </h3>
                {preference_match ? (
                    <p className="text-sm text-slate-600">
                        Matched via {preference_match} for {portfolio}
                    </p>
                ) : (
                    <p className="text-sm text-slate-600">
                        Applicant details for {portfolio}
                    </p>
                )}
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
                {entries.map(([key, value]) => (
                    <div key={key} className="rounded-md bg-slate-50 p-3">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            {key}
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                            {String(value)}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
