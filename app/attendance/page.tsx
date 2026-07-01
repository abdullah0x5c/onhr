"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app_shell";
import { AttendanceHistoryTable } from "@/components/attendance/attendance_history_table";
import { RosterChecklist } from "@/components/attendance/roster_checklist";
import { ErrorBanner } from "@/components/error_banner";
import { LoadingSpinner } from "@/components/loading_spinner";
import { PortfolioPicker } from "@/components/portfolio_picker";
import { ProtectedRoute } from "@/components/protected_route";
import { useAuth } from "@/context/auth_context";
import { get_today_iso, post_action } from "@/lib/api";
import type {
    AttendanceHistoryResponse,
    AttendanceStatus,
    MarkAttendanceResponse,
    Member,
    RosterResponse,
} from "@/lib/types";

export default function AttendancePage()
{
    const { user, effective_portfolio } = useAuth();
    const portfolio = effective_portfolio();

    const [members, set_members] = useState<Member[]>([]);
    const [statuses, set_statuses] = useState<Record<string, AttendanceStatus>>({});
    const [history, set_history] = useState<AttendanceHistoryResponse["records"]>([]);
    const [date, set_date] = useState(get_today_iso());
    const [submitted_date, set_submitted_date] = useState<string | null>(null);
    const [error_message, set_error_message] = useState("");
    const [success_message, set_success_message] = useState("");
    const [is_loading, set_is_loading] = useState(false);
    const [is_submitting, set_is_submitting] = useState(false);

    useEffect(() =>
    {
        set_submitted_date(null);
        set_success_message("");
    }, [portfolio]);

    const load_data = useCallback(async () =>
    {
        if (!user || !portfolio)
        {
            return;
        }

        set_is_loading(true);
        set_error_message("");

        try
        {
            const [roster_response, history_response] = await Promise.all([
                post_action<RosterResponse>({
                    action: "get_roster",
                    email: user.email,
                    portfolio,
                }),
                post_action<AttendanceHistoryResponse>({
                    action: "get_attendance",
                    email: user.email,
                    portfolio,
                }),
            ]);

            set_members(roster_response.members);
            set_history(history_response.records);

            const default_statuses: Record<string, AttendanceStatus> = {};
            for (const member of roster_response.members)
            {
                default_statuses[String(member["CMS ID"])] = "Present";
            }
            set_statuses(default_statuses);
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : "Failed to load attendance data";
            set_error_message(message);
        }
        finally
        {
            set_is_loading(false);
        }
    }, [user, portfolio]);

    useEffect(() =>
    {
        void load_data();
    }, [load_data]);

    function handle_status_change(cms_id: string, status: AttendanceStatus)
    {
        set_statuses((current) => ({ ...current, [cms_id]: status }));
    }

    async function handle_submit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();

        if (!user || !portfolio || submitted_date === date)
        {
            return;
        }

        set_is_submitting(true);
        set_error_message("");
        set_success_message("");

        try
        {
            const records = members.map((member) => ({
                cms_id: String(member["CMS ID"]),
                name: member["Full Name"],
                status: statuses[String(member["CMS ID"])] ?? "Present",
            }));

            const response = await post_action<MarkAttendanceResponse>({
                action: "mark_attendance",
                email: user.email,
                portfolio,
                date,
                records,
            });

            set_submitted_date(date);
            set_success_message(`Attendance saved for ${date} (${response.written} records).`);
            await load_data();
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : "Failed to submit attendance";
            set_error_message(message);
        }
        finally
        {
            set_is_submitting(false);
        }
    }

    const submit_disabled = is_submitting || is_loading || submitted_date === date;

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Attendance</h1>
                        <p className="text-sm text-slate-600">
                            Mark meeting attendance for your portfolio roster.
                        </p>
                    </div>

                    <PortfolioPicker />

                    {error_message ? <ErrorBanner message={error_message} /> : null}
                    {success_message ? (
                        <p className="text-sm text-green-700" data-testid="attendance-success">
                            {success_message}
                        </p>
                    ) : null}

                    {is_loading ? (
                        <LoadingSpinner label="Loading roster..." />
                    ) : (
                        <form onSubmit={handle_submit} className="space-y-4">
                            <label className="flex max-w-xs flex-col gap-1 text-sm">
                                <span className="font-medium">Meeting date</span>
                                <input
                                    type="date"
                                    data-testid="attendance-date"
                                    className="rounded-md border border-slate-300 px-3 py-2"
                                    value={date}
                                    onChange={(event) => set_date(event.target.value)}
                                    disabled={is_submitting}
                                    required
                                />
                            </label>

                            {submitted_date === date ? (
                                <p className="text-sm text-amber-700">
                                    Attendance for this date has already been submitted. Change the date to submit again.
                                </p>
                            ) : null}

                            <RosterChecklist
                                members={members}
                                statuses={statuses}
                                on_status_change={handle_status_change}
                                disabled={is_submitting || submitted_date === date}
                            />

                            <button
                                type="submit"
                                data-testid="attendance-submit"
                                disabled={submit_disabled || members.length === 0}
                                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {is_submitting ? "Submitting..." : "Submit attendance"}
                            </button>
                        </form>
                    )}

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">Attendance history</h2>
                        <AttendanceHistoryTable records={history} />
                    </section>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}
