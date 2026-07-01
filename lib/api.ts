import { API_BASE_URL } from "@/lib/constants";
import type { ApiError, ApiRequest, ApiResponse } from "@/lib/types";

export class ApiRequestError extends Error
{
    constructor(message: string)
    {
        super(message);
        this.name = "ApiRequestError";
    }
}

export async function post_action<T extends ApiResponse>(body: ApiRequest): Promise<T>
{
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
    });

    if (!response.ok)
    {
        throw new ApiRequestError(`request failed with status ${response.status}`);
    }

    const data = (await response.json()) as T | ApiError;

    if (!data.ok)
    {
        throw new ApiRequestError(data.error);
    }

    return data;
}

export async function check_backend_health(): Promise<boolean>
{
    try
    {
        const response = await fetch(API_BASE_URL, { method: "GET" });
        if (!response.ok)
        {
            return false;
        }

        const data = (await response.json()) as { ok?: boolean };
        return data.ok === true;
    }
    catch
    {
        return false;
    }
}

export function get_today_iso(): string
{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function extract_cms_id(raw: string | number | undefined): string
{
    const match = String(raw ?? "").match(/\d{6,}/);
    return match ? match[0].substring(0, 6) : "";
}

export function is_director_role(designation: string): boolean
{
    return designation === "Director" || designation === "Deputy Director";
}
