"use client";

import type { ReviewRow } from "@/lib/types";

export function ReviewsList({ reviews }: { reviews: ReviewRow[] })
{
    if (reviews.length === 0)
    {
        return (
            <p className="text-sm text-slate-600">
                No reviews are visible for this CMS ID in your current scope.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 font-medium">Timestamp</th>
                        <th className="px-4 py-3 font-medium">Reviewer</th>
                        <th className="px-4 py-3 font-medium">Portfolio</th>
                        <th className="px-4 py-3 font-medium">Recommendation</th>
                        <th className="px-4 py-3 font-medium">Review</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review, index) => (
                        <tr key={`${review.Timestamp}-${index}`} className="border-b border-slate-100">
                            <td className="px-4 py-3">{review.Timestamp}</td>
                            <td className="px-4 py-3">{review.Reviewer}</td>
                            <td className="px-4 py-3">{review.Portfolio}</td>
                            <td className="px-4 py-3">{review.Recommendation}</td>
                            <td className="px-4 py-3 whitespace-pre-wrap">{review["Review Text"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
