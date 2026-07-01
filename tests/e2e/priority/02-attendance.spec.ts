import { test, expect } from "@playwright/test";
import { install_mock_api, login_as } from "../../fixtures/mock_api";
import { MOCK_ATTENDANCE_HISTORY, MOCK_ROSTER } from "../../fixtures/mock_data";

test.describe("Priority: Attendance", () =>
{
    test.beforeEach(async ({ page }) =>
    {
        await install_mock_api(page);
        await login_as(page, "director");
    });

    test("loads roster checklist with all members defaulting to Present", async ({ page }) =>
    {
        await expect(page.getByTestId("roster-checklist")).toBeVisible();
        await expect(
            page.getByTestId("roster-checklist").getByRole("cell", { name: MOCK_ROSTER[0]["Full Name"] }),
        ).toBeVisible();
        await expect(
            page.getByTestId("roster-checklist").getByRole("cell", { name: MOCK_ROSTER[1]["Full Name"] }),
        ).toBeVisible();

        for (const member of MOCK_ROSTER)
        {
            const present_radio = page.locator(
                `input[name="status-${member["CMS ID"]}"][value="Present"]`,
            );
            await expect(present_radio).toBeChecked();
        }
    });

    test("shows attendance history from backend", async ({ page }) =>
    {
        await expect(page.getByTestId("attendance-history")).toBeVisible();
        await expect(
            page.getByTestId("attendance-history").getByRole("cell", { name: MOCK_ATTENDANCE_HISTORY[0].Name }),
        ).toBeVisible();
        await expect(
            page.getByTestId("attendance-history").getByRole("cell", { name: MOCK_ATTENDANCE_HISTORY[0].Status }),
        ).toBeVisible();
    });

    test("can change member status to Absent", async ({ page }) =>
    {
        const cms_id = MOCK_ROSTER[1]["CMS ID"];
        await page.locator(`input[name="status-${cms_id}"][value="Absent"]`).check();
        await expect(page.locator(`input[name="status-${cms_id}"][value="Absent"]`)).toBeChecked();
    });

    test("submits attendance and disables resubmit for same date", async ({ page }) =>
    {
        const submit_button = page.getByTestId("attendance-submit");
        await expect(submit_button).toBeEnabled();

        await submit_button.click();
        await expect(page.getByTestId("attendance-success")).toContainText("Attendance saved");
        await expect(submit_button).toBeDisabled();
        await expect(page.getByText(/already been submitted/i)).toBeVisible();
    });

    test("hides portfolio picker for single-portfolio director", async ({ page }) =>
    {
        await expect(page.getByTestId("portfolio-picker")).toHaveCount(0);
        await expect(page.getByText(/· Marketing$/)).toBeVisible();
    });
});
