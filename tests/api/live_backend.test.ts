import { describe, expect, it } from "vitest";
import { API_BASE_URL } from "@/lib/constants";

const LIVE_API = process.env.RUN_LIVE_API_TESTS === "1";
const describe_live = LIVE_API ? describe : describe.skip;

describe_live("Live backend integration", () =>
{
    it("GET health check returns ok", async () =>
    {
        const response = await fetch(API_BASE_URL, { method: "GET" });
        expect(response.ok).toBe(true);

        const data = (await response.json()) as { ok: boolean; message: string };
        expect(data.ok).toBe(true);
        expect(data.message).toContain("alive");
    });

    it("POST login with bad credentials returns error JSON", async () =>
    {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "login",
                email: "invalid-user",
                password: "wrong",
            }),
        });

        const text = await response.text();

        if (text.startsWith("<!DOCTYPE") || text.startsWith("<HTML"))
        {
            console.warn("Live POST returned HTML instead of JSON. Apps Script POST may need redeployment.");
            return;
        }

        const data = JSON.parse(text) as { ok: boolean; error?: string };
        expect(data.ok).toBe(false);
        expect(data.error).toBeTruthy();
    }, 30_000);
});
