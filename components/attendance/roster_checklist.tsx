"use client";

import { ATTENDANCE_STATUSES } from "@/lib/constants";
import type { AttendanceStatus, Member } from "@/lib/types";

type RosterChecklistProps = {
    members: Member[];
    statuses: Record<string, AttendanceStatus>;
    on_status_change: (cms_id: string, status: AttendanceStatus) => void;
    disabled?: boolean;
};

export function RosterChecklist({
    members,
    statuses,
    on_status_change,
    disabled = false,
}: RosterChecklistProps)
{
    if (members.length === 0)
    {
        return (
            <p className="text-sm text-slate-600">No roster members found for this portfolio.</p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">CMS ID</th>
                        <th className="px-4 py-3 font-medium">Designation</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) =>
                    {
                        const cms_id = String(member["CMS ID"]);
                        const current_status = statuses[cms_id] ?? "Present";

                        return (
                            <tr key={cms_id} className="border-b border-slate-100">
                                <td className="px-4 py-3">{member["Full Name"]}</td>
                                <td className="px-4 py-3">{cms_id}</td>
                                <td className="px-4 py-3">{member.Designation}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-3">
                                        {ATTENDANCE_STATUSES.map((status) => (
                                            <label
                                                key={status}
                                                className="inline-flex items-center gap-1"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`status-${cms_id}`}
                                                    value={status}
                                                    checked={current_status === status}
                                                    disabled={disabled}
                                                    onChange={() =>
                                                        on_status_change(
                                                            cms_id,
                                                            status as AttendanceStatus,
                                                        )
                                                    }
                                                />
                                                <span>{status}</span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
