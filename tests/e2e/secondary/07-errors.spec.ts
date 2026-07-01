import { test, expect } from "@playwright/test";
import { install_mock_api, login_as } from "../../fixtures/mock_api";

test.describe("Secondary: Error and edge states", () =>
{
    test("attendance date change re-enables submit after prior submission", async ({ page }) =>
    {
        await install_mock_api(page);
        await login_as(page, "director");

        const submit_button = page.getByTestId("attendance-submit");
        await submit_button.click();
        await expect(submit_button).toBeDisabled();

        const date_input = page.getByTestId("attendance-date");
        const current_date = await date_input.inputValue();
        const [year, month, day] = current_date.split("-").map(Number);
        const local_tomorrow = new Date(year, month - 1, day + 1);
        const tomorrow_iso = [
            local_tomorrow.getFullYear(),
            String(local_tomorrow.getMonth() + 1).padStart(2, "0"),
            String(local_tomorrow.getDate()).padStart(2, "0"),
        ].join("-");
        await date_input.fill(tomorrow_iso);

        await expect(submit_button).toBeEnabled();
    });

    test("reviews empty state does not claim no reviews exist", async ({ page }) =>
    {
        await install_mock_api(page);
        await login_as(page, "director");
        await page.getByTestId("nav-recruitment").click();

        await page.getByTestId("cms-search-input").fill("000000");
        await page.getByTestId("cms-search-submit").click();

        await expect(page.getByText(/No reviews are visible for this CMS ID/)).toBeVisible();
        await expect(page.getByText(/no reviews yet/i)).toHaveCount(0);
    });
});
