import { test, expect } from "@playwright/test";
import { install_mock_api } from "../../fixtures/mock_api";
import { MOCK_CREDENTIALS } from "../../fixtures/mock_data";

test.describe("Priority: Login", () =>
{
    test.beforeEach(async ({ page }) =>
    {
        await install_mock_api(page);
    });

    test("shows login form on /login", async ({ page }) =>
    {
        await page.goto("/login");
        await expect(page.getByRole("heading", { name: "NSVS HR Portal" })).toBeVisible();
        await expect(page.getByTestId("login-username")).toBeVisible();
        await expect(page.getByTestId("login-password")).toBeVisible();
        await expect(page.getByTestId("login-submit")).toBeVisible();
    });

    test("rejects invalid credentials with backend error", async ({ page }) =>
    {
        await page.goto("/login");
        await page.getByTestId("login-username").fill("wronguser");
        await page.getByTestId("login-password").fill("badpassword");
        await page.getByTestId("login-submit").click();

        await expect(page.getByText("invalid email or password")).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test("logs in director and redirects to attendance", async ({ page }) =>
    {
        const credentials = MOCK_CREDENTIALS.director;
        await page.goto("/login");
        await page.getByTestId("login-username").fill(credentials.username);
        await page.getByTestId("login-password").fill(credentials.password);
        await page.getByTestId("login-submit").click();

        await page.waitForURL("**/attendance");
        await expect(page.getByRole("heading", { name: "Attendance", exact: true })).toBeVisible();
        await expect(
            page.getByText(`${credentials.login.name} · ${credentials.login.designation}`),
        ).toBeVisible();
    });

    test("root redirects unauthenticated users to login", async ({ page }) =>
    {
        await page.goto("/");
        await page.waitForURL("**/login");
        await expect(page.getByTestId("login-submit")).toBeVisible();
    });
});
