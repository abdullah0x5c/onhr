import { describe, expect, it } from "vitest";
import { extract_cms_id, get_today_iso, is_director_role } from "@/lib/api";
import { PORTFOLIOS, RECOMMENDATIONS, ATTENDANCE_STATUSES } from "@/lib/constants";

describe("lib/api helpers", () =>
{
    it("extract_cms_id pulls first 6+ digit run", () =>
    {
        expect(extract_cms_id("512340")).toBe("512340");
        expect(extract_cms_id("(CMS ID) 512340")).toBe("512340");
        expect(extract_cms_id("no digits")).toBe("");
    });

    it("is_director_role matches director designations only", () =>
    {
        expect(is_director_role("Director")).toBe(true);
        expect(is_director_role("Deputy Director")).toBe(true);
        expect(is_director_role("HR Executive")).toBe(false);
        expect(is_director_role("Executive")).toBe(false);
    });

    it("get_today_iso returns YYYY-MM-DD format", () =>
    {
        const value = get_today_iso();
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe("constants", () =>
{
    it("defines exactly 5 portfolios", () =>
    {
        expect(PORTFOLIOS).toHaveLength(5);
        expect(PORTFOLIOS).toContain("Marketing");
        expect(PORTFOLIOS).toContain("Human Resources");
    });

    it("defines attendance statuses used by UI", () =>
    {
        expect(ATTENDANCE_STATUSES).toEqual(["Present", "Absent", "Leave"]);
    });

    it("defines recommendation options used by review form", () =>
    {
        expect(RECOMMENDATIONS).toEqual(["Recommended", "Backup", "Not Recommended"]);
    });
});
