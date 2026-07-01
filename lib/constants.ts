export const API_BASE_URL: string =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://script.google.com/macros/s/AKfycbyYGkPJFTi5iKLoOT7rmddDNPxZsLy3RmN2vT-y3guY0NeRZlh_M0wHAhkuxsQAus65HA/exec";

export const PORTFOLIOS: readonly string[] = [
    "Human Resources",
    "External Relations",
    "Marketing",
    "Admin Events",
    "Sponsorships",
] as const;

export const ATTENDANCE_STATUSES: readonly string[] = [
    "Present",
    "Absent",
    "Leave",
] as const;

export const RECOMMENDATIONS: readonly string[] = [
    "Recommended",
    "Backup",
    "Not Recommended",
] as const;

export const DIRECTOR_DESIGNATIONS: readonly string[] = [
    "Director",
    "Deputy Director",
] as const;
