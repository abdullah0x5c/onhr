"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app_shell";
import { ApplicantDetail } from "@/components/recruitment/applicant_detail";
import { ApplicantsTable } from "@/components/recruitment/applicants_table";
import { CmsSearch } from "@/components/recruitment/cms_search";
import { ReviewForm } from "@/components/recruitment/review_form";
import { ReviewsList } from "@/components/recruitment/reviews_list";
import { ErrorBanner } from "@/components/error_banner";
import { LoadingSpinner } from "@/components/loading_spinner";
import { PortfolioPicker } from "@/components/portfolio_picker";
import { ProtectedRoute } from "@/components/protected_route";
import { useAuth } from "@/context/auth_context";
import { is_director_role, post_action } from "@/lib/api";
import type {
    Applicant,
    ApplicantByCmsResponse,
    ApplicantsResponse,
    ReviewsResponse,
} from "@/lib/types";

export default function RecruitmentPage()
{
    const router = useRouter();
    const { user, effective_portfolio } = useAuth();
    const portfolio = effective_portfolio();

    const [applicants, set_applicants] = useState<Applicant[]>([]);
    const [selected_applicant, set_selected_applicant] = useState<Applicant | null>(null);
    const [selected_cms_id, set_selected_cms_id] = useState<string | null>(null);
    const [reviews, set_reviews] = useState<ReviewsResponse["reviews"]>([]);
    const [error_message, set_error_message] = useState("");
    const [is_loading_applicants, set_is_loading_applicants] = useState(false);
    const [is_loading_applicant, set_is_loading_applicant] = useState(false);

    useEffect(() =>
    {
        if (user && !is_director_role(user.designation))
        {
            router.replace("/attendance");
        }
    }, [user, router]);

    const load_applicants = useCallback(async () =>
    {
        if (!user || !portfolio)
        {
            return;
        }

        set_is_loading_applicants(true);
        set_error_message("");

        try
        {
            const response = await post_action<ApplicantsResponse>({
                action: "get_applicants",
                email: user.email,
                portfolio,
            });

            set_applicants(response.applicants);
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : "Failed to load applicants";
            set_error_message(message);
        }
        finally
        {
            set_is_loading_applicants(false);
        }
    }, [user, portfolio]);

    const load_applicant_and_reviews = useCallback(
        async (cms_id: string) =>
        {
            if (!user || !portfolio)
            {
                return;
            }

            set_is_loading_applicant(true);
            set_error_message("");
            set_selected_cms_id(cms_id);

            try
            {
                const [applicant_response, reviews_response] = await Promise.all([
                    post_action<ApplicantByCmsResponse>({
                        action: "get_applicant_by_cms",
                        email: user.email,
                        cms_id,
                    }),
                    post_action<ReviewsResponse>({
                        action: "get_reviews",
                        email: user.email,
                        cms_id,
                    }),
                ]);

                set_selected_applicant(applicant_response.applicant);
                set_reviews(reviews_response.reviews);
            }
            catch (error)
            {
                const message = error instanceof Error ? error.message : "Failed to load applicant";
                set_error_message(message);
                set_selected_applicant(null);
                set_reviews([]);
            }
            finally
            {
                set_is_loading_applicant(false);
            }
        },
        [user, portfolio],
    );

    useEffect(() =>
    {
        void load_applicants();
        set_selected_applicant(null);
        set_selected_cms_id(null);
        set_reviews([]);
    }, [load_applicants]);

    if (!user || !is_director_role(user.designation))
    {
        return null;
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Recruitment</h1>
                        <p className="text-sm text-slate-600">
                            Look up applicants, review interviews, and browse portfolio applications.
                        </p>
                    </div>

                    <PortfolioPicker />

                    {error_message ? <ErrorBanner message={error_message} /> : null}

                    <CmsSearch
                        email={user.email}
                        on_applicant_found={(cms_id) => void load_applicant_and_reviews(cms_id)}
                    />

                    {is_loading_applicant ? (
                        <LoadingSpinner label="Loading applicant..." />
                    ) : null}

                    {selected_applicant && portfolio ? (
                        <ApplicantDetail applicant={selected_applicant} portfolio={portfolio} />
                    ) : null}

                    {selected_cms_id && portfolio ? (
                        <ReviewForm
                            email={user.email}
                            portfolio={portfolio}
                            cms_id={selected_cms_id}
                            on_review_added={() => void load_applicant_and_reviews(selected_cms_id)}
                        />
                    ) : null}

                    {selected_cms_id ? (
                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold">Existing reviews</h2>
                            <ReviewsList reviews={reviews} />
                        </section>
                    ) : null}

                    <section className="space-y-3">
                        {is_loading_applicants ? (
                            <LoadingSpinner label="Loading applicants..." />
                        ) : (
                            <ApplicantsTable
                                applicants={applicants}
                                selected_cms_id={selected_cms_id}
                                on_select={(cms_id) => void load_applicant_and_reviews(cms_id)}
                            />
                        )}
                    </section>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}
