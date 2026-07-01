import { test, expect } from "@playwright/test";
import { install_mock_api, login_as } from "../../fixtures/mock_api";

test.describe("Secondary: Auth guards and role access", () =>
{
    test.beforeEach(async ({ page }) =>
    {
        await install_mock_api(page);
    });

    test("unauthenticated user cannot access attendance", async ({ page }) =>
    {
        await page.goto("/attendance");
        await page.waitForURL("**/login");
        await expect(page.getByTestId("login-submit")).toBeVisible();
    });

    test("unauthenticated user cannot access recruitment", async ({ page }) =>
    {
        await page.goto("/recruitment");
        await page.waitForURL("**/login");
        await expect(page.getByTestId("login-submit")).toBeVisible();
    });

    test("HR executive sees attendance but not recruitment nav", async ({ page }) =>
    {
        await login_as(page, "hr_executive");
        await expect(page.getByTestId("nav-attendance")).toBeVisible();
        await expect(page.getByTestId("nav-recruitment")).toHaveCount(0);
    });

    test("HR executive is redirected away from recruitment URL", async ({ page }) =>
    {
        await login_as(page, "hr_executive");
        await page.goto("/recruitment");
        await page.waitForURL("**/attendance");
    });

    test("logout clears session and returns to login", async ({ page }) =>
    {
        await login_as(page, "director");
        await page.getByTestId("nav-logout").click();
        await page.waitForURL("**/login");

        await page.goto("/attendance");
        await page.waitForURL("**/login");
    });
});
