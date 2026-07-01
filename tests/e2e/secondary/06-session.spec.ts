import { test, expect } from "@playwright/test";
import { install_mock_api, login_as } from "../../fixtures/mock_api";
import { MOCK_CREDENTIALS } from "../../fixtures/mock_data";

test.describe("Secondary: Session persistence", () =>
{
    test.beforeEach(async ({ page }) =>
    {
        await install_mock_api(page);
    });

    test("session survives page reload", async ({ page }) =>
    {
        await login_as(page, "director");
        await page.reload();
        await expect(page.getByRole("heading", { name: "Attendance", exact: true })).toBeVisible();
        await expect(
            page.getByText(`${MOCK_CREDENTIALS.director.login.name} · ${MOCK_CREDENTIALS.director.login.designation}`),
        ).toBeVisible();
    });

    test("session survives navigation between attendance and recruitment", async ({ page }) =>
    {
        await login_as(page, "director");
        await page.getByTestId("nav-recruitment").click();
        await expect(page.getByRole("heading", { name: "Recruitment" })).toBeVisible();

        await page.getByTestId("nav-attendance").click();
        await expect(page.getByRole("heading", { name: "Attendance", exact: true })).toBeVisible();
        await expect(
            page.getByText(`${MOCK_CREDENTIALS.director.login.name} · ${MOCK_CREDENTIALS.director.login.designation}`),
        ).toBeVisible();
    });
});
