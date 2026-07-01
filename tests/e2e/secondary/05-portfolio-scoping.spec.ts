import { test, expect } from "@playwright/test";
import { install_mock_api, login_as } from "../../fixtures/mock_api";
import { PORTFOLIOS } from "@/lib/constants";

test.describe("Secondary: Portfolio scoping", () =>
{
    test.beforeEach(async ({ page }) =>
    {
        await install_mock_api(page);
    });

    test("HR director with all scope sees portfolio picker on attendance", async ({ page }) =>
    {
        await login_as(page, "hr_director");
        await expect(page.getByTestId("portfolio-picker")).toBeVisible();
        await expect(page.getByTestId("portfolio-picker")).toHaveValue(PORTFOLIOS[0]);
    });

    test("changing portfolio picker reloads attendance context", async ({ page }) =>
    {
        await login_as(page, "hr_director");
        await page.getByTestId("portfolio-picker").selectOption("Marketing");
        await expect(page.getByTestId("portfolio-picker")).toHaveValue("Marketing");
        await expect(page.getByText(/· Marketing$/)).toBeVisible();
        await expect(page.getByTestId("roster-checklist")).toBeVisible();
    });

    test("HR director sees portfolio picker on recruitment page", async ({ page }) =>
    {
        await login_as(page, "hr_director");
        await page.getByTestId("nav-recruitment").click();
        await expect(page.getByTestId("portfolio-picker")).toBeVisible();
    });
});
