# NSVS HR Portal, backend context for frontend build

This is a prototype HR system for a university society (NUST). The backend is already built and deployed as a Google Apps Script Web App backed by two Google Sheets. Your job is the frontend only. Do not touch or redesign the backend, it is finished and tested.

## API base URL

```
https://script.google.com/macros/s/AKfycbyYGkPJFTi5iKLoOT7rmddDNPxZsLy3RmN2vT-y3guY0NeRZlh_M0wHAhkuxsQAus65HA/exec
```

Every request except a plain health check is a `POST` to this exact URL with a JSON body. There is no separate endpoint per action, one URL handles everything, routed internally by an `action` field.

`GET` on the same URL returns `{"ok": true, "message": "NSVS backend is alive"}`, useful only as a connectivity check, not for real data.

## Critical fetch detail, read this first

Google Apps Script Web Apps do not implement CORS preflight (`OPTIONS`) handling. If you send a request with `Content-Type: application/json`, the browser will send a preflight request first and it will fail. You must send the request as:

```javascript
fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "login", email, password })
});
```

The body is still a JSON string, only the header is `text/plain`. This avoids the preflight entirely. Every single request to this backend must use this pattern.

## Authentication model, and its real limitation

There is no session token, no JWT, nothing signed. Login just checks email and password against a sheet and returns the caller's permission scope. Every subsequent request must include that same `email` in the body, and the backend re-derives the caller's permissions from the sheet on every single call, it does not trust anything the client claims about its own role or portfolio.

This means: after a successful login, store `email`, `name`, `designation`, and `allowed_portfolio` from the response (React context, a cookie, whatever), and attach `email` to every future request body.

Be upfront with whoever you're building this for: this is not secure against someone who already knows another user's email, since there's no re-check of the password after login. That's an accepted prototype tradeoff, not an oversight to silently fix by adding scope-checking logic client side, the server already does the real enforcement, the client just needs to pass the email along.

## Portfolios in this prototype

There are exactly 5 work-unit portfolios, hardcode this list, there is no endpoint that returns it:

```
Human Resources
External Relations
Marketing
Admin Events
Sponsorships
```

## Roles and what each one is allowed to see

Four designations exist: `Director`, `Deputy Director`, `Executive`, `HR Executive`. Only the first two and the last one ever log in, plain `Executive` has no account and is only ever data being looked at by someone else.

A `Director` or `Deputy Director` of a normal portfolio (anything except Human Resources) is scoped to exactly that one portfolio. Their `allowed_portfolio` from login will be that portfolio's exact name, e.g. `"Marketing"`.

An `HR Executive` is scoped to exactly one other portfolio, whichever one they're assigned to cover for attendance purposes. Their `allowed_portfolio` will also be one exact portfolio name, but note their `home_portfolio` field will say `"Human Resources"`, that's their own home team, not the portfolio they're scoped to act on, use `allowed_portfolio` for all access logic, never `home_portfolio`.

The HR `Director` and HR `Deputy Director` (the leadership of the Human Resources portfolio itself) have `allowed_portfolio` equal to the literal string `"all"`. This means their UI needs an extra portfolio picker dropdown (the 5 names above) since the backend requires them to specify which portfolio they mean on every request, everyone else never needs to pick, their one portfolio is implicit.

Practical rule for your UI: if `allowed_portfolio !== "all"`, never show a portfolio selector at all, just silently operate on that one portfolio everywhere. If it is `"all"`, show a selector and pass whatever's selected as the `portfolio` field on every request that needs one.

## Every endpoint, exact shapes

All requests are `POST` with `action` plus the fields below. All responses are JSON with at least an `ok` boolean. On failure, expect `{ "ok": false, "error": "human readable reason" }`, always render `error` directly, don't try to pattern match on it.

### `login`

Request:
```json
{ "action": "login", "email": "someone@example.com", "password": "test123" }
```

Response:
```json
{
    "ok": true,
    "name": "Iram Nazish",
    "designation": "Director",
    "home_portfolio": "Marketing",
    "allowed_portfolio": "Marketing"
}
```

### `get_roster`

Fetches every OC member of a portfolio, this is what populates an attendance checklist.

Request:
```json
{ "action": "get_roster", "email": "someone@example.com", "portfolio": "Marketing" }
```
`portfolio` is optional and ignored unless the caller's scope is `"all"`, in which case it's required.

Response:
```json
{
    "ok": true,
    "portfolio": "Marketing",
    "members": [
        {
            "Wing": "Executive Council",
            "Portfolio": "Marketing",
            "Designation": "Director",
            "Full Name": "Iram Nazish",
            "Gender": "Female",
            "Contact No.": "03461288950",
            "Email Address": "iram.nazish24@student.nust.edu.pk",
            "CMS ID": "512825",
            "Batch": 2024,
            "Department": "SCME",
            "Residential Status": "Internal Hostelite",
            "Hostel": "Amna"
        }
    ]
}
```
Field names are exactly as shown, including the space and period in `"Contact No."`, and the sheet's original header casing, since the backend passes sheet headers straight through as JSON keys.

### `mark_attendance`

Request:
```json
{
    "action": "mark_attendance",
    "email": "hr.exec@example.com",
    "portfolio": "Marketing",
    "date": "2026-07-02",
    "records": [
        { "cms_id": "512825", "name": "Iram Nazish", "status": "Present" },
        { "cms_id": "460700", "name": "Muhammad Touseef Akhtar", "status": "Absent" }
    ]
}
```
`status` is a free-text field, the sample data uses `Present`, `Absent`, `Leave`, stick to those three for consistency in the UI (radio buttons or a select, not free text).

Response:
```json
{ "ok": true, "written": 2 }
```
This always appends new rows, it never overwrites a previous submission for the same date, so if a user submits attendance twice for the same meeting you'll get duplicate rows. Handle that on the frontend, either disable the submit button after one successful submission, or warn the user before resubmitting the same date.

### `get_attendance`

Request:
```json
{ "action": "get_attendance", "email": "someone@example.com", "portfolio": "Marketing" }
```

Response:
```json
{
    "ok": true,
    "portfolio": "Marketing",
    "records": [
        { "Date": "2026-06-16", "Portfolio": "Marketing", "CMS ID": "512825", "Name": "Iram Nazish", "Status": "Present", "Marked By": "Ayla Asgher" }
    ]
}
```

### `get_applicants`

Only works for `Director` or `Deputy Director` accounts, an `HR Executive` calling this gets rejected with `ok: false`.

Request:
```json
{ "action": "get_applicants", "email": "director@example.com", "portfolio": "Marketing" }
```

Response:
```json
{
    "ok": true,
    "portfolio": "Marketing",
    "applicants": [
        {
            "Timestamp": "2026-05-14 10:22:00",
            "Email Address": "...",
            "Name": "...",
            "Phone Number": "...",
            "Registration Number": "512340",
            "Batch": 2024,
            "School": "SEECS",
            "1st preference": "Marketing",
            "2nd preference": "Finance",
            "Why do you want to be a part of NCBS?": "...",
            "...": "the rest of the essay fields, same header names as the sheet"
        }
    ]
}
```
This includes people who picked the portfolio as either their 1st or 2nd preference, both show up in the same list, there's no field telling you which one matched, if that distinction matters for the UI, compare `1st preference` and `2nd preference` yourself against the portfolio you asked for.

### `get_applicant_by_cms`

The single-applicant lookup a director uses when someone walks into an interview and gives their CMS ID.

Request:
```json
{ "action": "get_applicant_by_cms", "email": "director@example.com", "cms_id": "512340" }
```

Response on match:
```json
{ "ok": true, "applicant": { "...": "same shape as one row from get_applicants" } }
```

If the caller's scope isn't `"all"`, and the applicant didn't list that caller's portfolio as either preference, this returns `{ "ok": false, "error": "applicant did not apply to your portfolio" }`, this is intentional, a Marketing director cannot browse an Admin Events applicant this way.

`cms_id` matching is fuzzy on the backend, it extracts the first run of 6+ digits out of whatever string is stored, so it tolerates messy input like `"(CMS ID) 512340"` in the underlying sheet. From the frontend, just send the plain digits the user typed, you don't need to pre-clean anything, but do tell the user plainly if the lookup returns not-found, don't assume it means the CMS ID is wrong, the underlying form entry might just be unparseable garbage, a manual name-search fallback in your UI is worth having.

### `add_review`

Only works for `Director` or `Deputy Director`.

Request:
```json
{
    "action": "add_review",
    "email": "director@example.com",
    "portfolio": "Marketing",
    "cms_id": "512340",
    "review_text": "Strong communicator, recommend for next round.",
    "recommendation": "Recommended"
}
```
`recommendation` is free text in the backend, the sample data uses `Recommended`, `Backup`, `Not Recommended`, use a fixed select with those three options.

Response:
```json
{ "ok": true }
```

### `get_reviews`

Request:
```json
{ "action": "get_reviews", "email": "someone@example.com", "cms_id": "512340" }
```

Response:
```json
{ "ok": true, "reviews": [ { "CMS ID": "512340", "Portfolio": "Marketing", "Reviewer": "Iram Nazish", "Review Text": "...", "Recommendation": "Recommended", "Timestamp": "2026-06-10 14:02:11" } ] }
```
If the caller's scope isn't `"all"`, reviews written under a different portfolio than the caller's own are silently excluded, not errored, an empty `reviews` array here can mean either "no reviews yet" or "reviews exist but aren't visible to you", the frontend can't distinguish these, don't build UI copy that assumes the former.

## Suggested page structure

A login screen collecting email and password, calling `login`, and holding the response in whatever app-wide state you're using, this state needs to survive navigation between pages for the whole session.

An attendance page. If `allowed_portfolio === "all"`, show the 5-portfolio dropdown first. Once a portfolio is known, call `get_roster`, render every member with a three-way status control defaulted to `Present`, a date picker defaulted to today, and a submit button that calls `mark_attendance` once, then disables itself.

A recruitment page with a CMS ID search box calling `get_applicant_by_cms`, displaying the full essay answers and skill ratings, plus a small form beneath it (recommendation select, review text box) that calls `add_review`. Below that, a list of any existing reviews for that CMS ID via `get_reviews`. Optionally also a browsable list of every applicant to the director's portfolio via `get_applicants`, if the CMS ID is unknown.

## Known constraints to keep in mind

Google Sheets, and this Apps Script layer over it, is not built for concurrent writers, at this scale (dozens of people, one submission at a time) it will not have problems, don't add complexity trying to handle race conditions that won't occur in practice here.

There is no delete or update endpoint for attendance or reviews, only append and read. If wrong data gets written during testing, it currently has to be removed by hand in the sheet. If you need an edit/delete flow for the frontend to feel complete, that's a backend change, flag it back rather than trying to fake it client side.
