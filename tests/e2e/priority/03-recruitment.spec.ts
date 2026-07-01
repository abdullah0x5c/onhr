import { test, expect } from "@playwright/test";
import { install_mock_api, login_as } from "../../fixtures/mock_api";
import { MOCK_APPLICANT, MOCK_REVIEWS } from "../../fixtures/mock_data";

test.describe("Priority: Recruitment", () =>
{
    test.beforeEach(async ({ page }) =>
    {
        await install_mock_api(page);
        await login_as(page, "director");
        await page.getByTestId("nav-recruitment").click();
        await page.waitForURL("**/recruitment");
    });

    test("director can access recruitment page", async ({ page }) =>
    {
        await expect(page.getByRole("heading", { name: "Recruitment" })).toBeVisible();
        await expect(page.getByTestId("cms-search-form")).toBeVisible();
        await expect(page.getByTestId("applicants-table")).toBeVisible();
    });

    test("CMS ID lookup shows applicant detail and existing reviews", async ({ page }) =>
    {
        await page.getByTestId("cms-search-input").fill("512340");
        await page.getByTestId("cms-search-submit").click();

        await expect(page.getByTestId("applicant-detail")).toBeVisible();
        await expect(
            page.getByTestId("applicant-detail").getByRole("heading", { name: String(MOCK_APPLICANT.Name) }),
        ).toBeVisible();
        await expect(page.getByText(/Matched via 1st preference/)).toBeVisible();
        await expect(page.getByTestId("reviews-list")).toBeVisible();
        await expect(
            page.getByTestId("reviews-list").getByRole("cell", { name: MOCK_REVIEWS[0]["Review Text"] }),
        ).toBeVisible();
    });

    test("can submit a new review", async ({ page }) =>
    {
        await page.getByTestId("cms-search-input").fill("512340");
        await page.getByTestId("cms-search-submit").click();
        await expect(page.getByTestId("review-form")).toBeVisible();

        await page.getByTestId("review-text").fill("Excellent interview performance.");
        await page.getByTestId("review-submit").click();

        await expect(page.getByText("Review submitted.")).toBeVisible();
    });

    test("applicant table row click loads applicant", async ({ page }) =>
    {
        await page.getByTestId("applicants-table").getByText(String(MOCK_APPLICANT.Name)).click();
        await expect(page.getByTestId("applicant-detail")).toBeVisible();
        await expect(page.getByTestId("review-form")).toBeVisible();
    });

    test("applicant search filters by name", async ({ page }) =>
    {
        await page.getByTestId("applicants-search").fill("Test Applicant");
        await expect(page.getByText("Test Applicant")).toBeVisible();

        await page.getByTestId("applicants-search").fill("No Such Person");
        await expect(page.getByText("No applicants match your search.")).toBeVisible();
    });

    test("shows error for unknown CMS ID", async ({ page }) =>
    {
        await page.getByTestId("cms-search-input").fill("999999");
        await page.getByTestId("cms-search-submit").click();

        await expect(page.getByText("no applicant found for that cms id")).toBeVisible();
        await expect(page.getByText(/Try the applicant list below/)).toBeVisible();
    });
});
