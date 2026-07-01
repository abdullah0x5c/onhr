"use client";

import type { AttendanceHistoryRow } from "@/lib/types";

export function AttendanceHistoryTable({ records }: { records: AttendanceHistoryRow[] })
{
    if (records.length === 0)
    {
        return (
            <p className="text-sm text-slate-600">No attendance records found for this portfolio.</p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">CMS ID</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Marked By</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, index) => (
                        <tr key={`${record.Date}-${record["CMS ID"]}-${index}`} className="border-b border-slate-100">
                            <td className="px-4 py-3">{record.Date}</td>
                            <td className="px-4 py-3">{record.Name}</td>
                            <td className="px-4 py-3">{record["CMS ID"]}</td>
                            <td className="px-4 py-3">{record.Status}</td>
                            <td className="px-4 py-3">{record["Marked By"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
