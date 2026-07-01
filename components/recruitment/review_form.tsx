"use client";

import { useState } from "react";
import { post_action } from "@/lib/api";
import { RECOMMENDATIONS } from "@/lib/constants";
import type { AddReviewResponse, Recommendation } from "@/lib/types";
import { ErrorBanner } from "@/components/error_banner";

type ReviewFormProps = {
    email: string;
    portfolio: string;
    cms_id: string;
    on_review_added: () => void;
};

export function ReviewForm({
    email,
    portfolio,
    cms_id,
    on_review_added,
}: ReviewFormProps)
{
    const [recommendation, set_recommendation] = useState<Recommendation>("Recommended");
    const [review_text, set_review_text] = useState("");
    const [error_message, set_error_message] = useState("");
    const [success_message, set_success_message] = useState("");
    const [is_submitting, set_is_submitting] = useState(false);

    async function handle_submit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();
        set_error_message("");
        set_success_message("");
        set_is_submitting(true);

        try
        {
            await post_action<AddReviewResponse>({
                action: "add_review",
                email,
                portfolio,
                cms_id,
                review_text,
                recommendation,
            });

            set_review_text("");
            set_success_message("Review submitted.");
            on_review_added();
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : "Failed to submit review";
            set_error_message(message);
        }
        finally
        {
            set_is_submitting(false);
        }
    }

    return (
        <form onSubmit={handle_submit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4" data-testid="review-form">
            <h3 className="text-base font-semibold">Add review</h3>

            <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Recommendation</span>
                <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={recommendation}
                    onChange={(event) =>
                        set_recommendation(event.target.value as Recommendation)
                    }
                    disabled={is_submitting}
                >
                    {RECOMMENDATIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Review text</span>
                <textarea
                    data-testid="review-text"
                    className="min-h-28 rounded-md border border-slate-300 px-3 py-2"
                    value={review_text}
                    onChange={(event) => set_review_text(event.target.value)}
                    disabled={is_submitting}
                    required
                />
            </label>

            {error_message ? <ErrorBanner message={error_message} /> : null}
            {success_message ? (
                <p className="text-sm text-green-700">{success_message}</p>
            ) : null}

            <button
                type="submit"
                data-testid="review-submit"
                disabled={is_submitting}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                {is_submitting ? "Submitting..." : "Submit review"}
            </button>
        </form>
    );
}
