import type { Page, Route } from "@playwright/test";
import {
    API_URL_PATTERN,
    MOCK_APPLICANT,
    MOCK_APPLICANTS,
    MOCK_ATTENDANCE_HISTORY,
    MOCK_CREDENTIALS,
    MOCK_REVIEWS,
    MOCK_ROSTER,
} from "./mock_data";

type ActionBody = {
    action: string;
    email?: string;
    password?: string;
    portfolio?: string;
    cms_id?: string;
    date?: string;
    records?: unknown[];
    review_text?: string;
    recommendation?: string;
};

function json_response(route: Route, body: unknown, status = 200): Promise<void>
{
    return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
    });
}

function find_login(username: string, password: string)
{
    for (const entry of Object.values(MOCK_CREDENTIALS))
    {
        if (entry.username === username && entry.password === password)
        {
            return entry.login;
        }
    }

    return null;
}

async function handle_post(route: Route): Promise<void>
{
    const request = route.request();
    const raw_body = request.postData() ?? "{}";
    let body: ActionBody;

    try
    {
        body = JSON.parse(raw_body) as ActionBody;
    }
    catch
    {
        await json_response(route, { ok: false, error: "bad json body" });
        return;
    }

    switch (body.action)
    {
        case "login":
        {
            const login = find_login(body.email ?? "", body.password ?? "");
            if (!login)
            {
                await json_response(route, { ok: false, error: "invalid email or password" });
                return;
            }

            await json_response(route, login);
            return;
        }
        case "get_roster":
            await json_response(route, {
                ok: true,
                portfolio: body.portfolio ?? "Marketing",
                members: MOCK_ROSTER,
            });
            return;
        case "get_attendance":
            await json_response(route, {
                ok: true,
                portfolio: body.portfolio ?? "Marketing",
                records: MOCK_ATTENDANCE_HISTORY,
            });
            return;
        case "mark_attendance":
            await json_response(route, { ok: true, written: body.records?.length ?? 0 });
            return;
        case "get_applicants":
            await json_response(route, {
                ok: true,
                portfolio: body.portfolio ?? "Marketing",
                applicants: MOCK_APPLICANTS,
            });
            return;
        case "get_applicant_by_cms":
            if (body.cms_id === "999999")
            {
                await json_response(route, { ok: false, error: "no applicant found for that cms id" });
                return;
            }

            if (body.cms_id === "000000")
            {
                await json_response(route, {
                    ok: true,
                    applicant: { ...MOCK_APPLICANT, "Registration Number": "000000", Name: "Empty Reviews Applicant" },
                });
                return;
            }

            await json_response(route, { ok: true, applicant: MOCK_APPLICANT });
            return;
        case "get_reviews":
            await json_response(route, {
                ok: true,
                reviews: body.cms_id === "000000" ? [] : MOCK_REVIEWS,
            });
            return;
        case "add_review":
            await json_response(route, { ok: true });
            return;
        default:
            await json_response(route, { ok: false, error: `unknown action: ${body.action}` });
    }
}

export async function install_mock_api(page: Page): Promise<void>
{
    await page.route(API_URL_PATTERN, async (route) =>
    {
        const method = route.request().method();

        if (method === "GET")
        {
            await json_response(route, { ok: true, message: "NSVS backend is alive" });
            return;
        }

        if (method === "POST")
        {
            await handle_post(route);
            return;
        }

        await route.continue();
    });
}

export async function login_as(
    page: Page,
    role: keyof typeof MOCK_CREDENTIALS,
): Promise<void>
{
    const credentials = MOCK_CREDENTIALS[role];
    await page.goto("/login");
    await page.getByTestId("login-username").fill(credentials.username);
    await page.getByTestId("login-password").fill(credentials.password);
    await page.getByTestId("login-submit").click();
    await page.waitForURL("**/attendance");
}
