// ====================================================================
// NSVS Backend  ---  bound to NSVS_Prototype_Database spreadsheet
// Deploy as Web App (Execute as: Me, Access: Anyone with link)
//
// deployed exec URL (this is what the frontend calls):
// https://script.google.com/macros/s/AKfycbyYGkPJFTi5iKLoOT7rmddDNPxZsLy3RmN2vT-y3guY0NeRZlh_M0wHAhkuxsQAus65HA/exec
// ====================================================================

var SHEET_OC          = "OC";
var SHEET_LOGIN        = "login";
var SHEET_HR_PORTFOLIO = "Hr - Portfolio";
var SHEET_ATTENDANCE   = "Attendance";
var SHEET_REVIEWS      = "Reviews";
var SHEET_APPLICANTS   = "Form Responses";

// --------------------------------------------------------------------
// paste either the full spreadsheet URL or just the ID for each of
// your two Google Sheets. both must be shared as "anyone with the
// link can edit" so this standalone script can reach them by ID.
// --------------------------------------------------------------------

var DATABASE_SPREADSHEET_URL = "PASTE_YOUR_NSVS_DATABASE_SHEET_URL_OR_ID_HERE";
var FORM_SPREADSHEET_URL     = "PASTE_YOUR_RECRUITMENT_FORM_SHEET_URL_OR_ID_HERE";

var database_book_cache = null;
var form_book_cache = null;

function extract_sheet_id(url_or_id)
{
    var match = String(url_or_id).match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url_or_id;
}

function open_database_book()
{
    if (!database_book_cache)
    {
        database_book_cache = SpreadsheetApp.openById(extract_sheet_id(DATABASE_SPREADSHEET_URL));
    }
    return database_book_cache;
}

function open_form_book()
{
    if (!form_book_cache)
    {
        form_book_cache = SpreadsheetApp.openById(extract_sheet_id(FORM_SPREADSHEET_URL));
    }
    return form_book_cache;
}

// --------------------------------------------------------------------
// low level sheet helpers
// --------------------------------------------------------------------

function get_sheet(name)
{
    if (name === SHEET_APPLICANTS)
    {
        return open_form_book().getSheetByName(name);
    }
    return open_database_book().getSheetByName(name);
}

function read_sheet_as_objects(sheet, forward_fill_cols)
{
    forward_fill_cols = forward_fill_cols || [];
    var values = sheet.getDataRange().getValues();
    var header = values[0];
    var last_seen = {};
    var out = [];

    for (var r = 1; r < values.length; r++)
    {
        var row = values[r];
        var obj = {};

        for (var c = 0; c < header.length; c++)
        {
            var key = header[c];
            var val = row[c];

            if (forward_fill_cols.indexOf(c) !== -1)
            {
                if (val === "" || val === null)
                {
                    val = last_seen[c] || "";
                }
                else
                {
                    last_seen[c] = val;
                }
            }

            obj[key] = val;
        }

        var has_data = row.some(function (v) { return v !== "" && v !== null; });
        if (has_data)
        {
            out.push(obj);
        }
    }

    return out;
}

function append_row(sheet, values)
{
    sheet.appendRow(values);
}

function normalize(s)
{
    return String(s || "").trim().toLowerCase();
}

function json_response(obj)
{
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

function error_response(message)
{
    return json_response({ ok: false, error: message });
}

// --------------------------------------------------------------------
// access control
//
// every account lives in "login". a Director / Deputy Director of a
// normal portfolio is scoped to that portfolio. an HR Executive is
// scoped to whatever portfolio "Hr - Portfolio" says they cover. the
// HR Director / HR Deputy Directors are tagged "all" in that same
// sheet, so they alone can reach every portfolio.
// --------------------------------------------------------------------

function resolve_caller_scope(email)
{
    var email_n = normalize(email);
    var accounts = read_sheet_as_objects(get_sheet(SHEET_LOGIN), [0, 1]);

    var account = null;
    for (var i = 0; i < accounts.length; i++)
    {
        if (normalize(accounts[i]["Email"]) === email_n)
        {
            account = accounts[i];
            break;
        }
    }

    if (!account)
    {
        return null;
    }

    var hr_rows = read_sheet_as_objects(get_sheet(SHEET_HR_PORTFOLIO), [0]);
    var hr_row = null;
    for (var j = 0; j < hr_rows.length; j++)
    {
        if (hr_rows[j]["Name"] === account["Name"])
        {
            hr_row = hr_rows[j];
            break;
        }
    }

    var allowed = account["Portfolio"];   // default: own portfolio

    if (hr_row)
    {
        allowed = hr_row["Covers Portfolio"];   // "all", or one covered portfolio
    }

    return {
        name:        account["Name"],
        designation: account["Designation"],
        home_portfolio: account["Portfolio"],
        allowed:     allowed
    };
}

// checks whether `email` may act on `requested_portfolio`. returns
// { ok:true, portfolio } or { ok:false, error }. if the caller's scope
// is "all" and no portfolio was requested, that is itself an error,
// since "all" scope still needs to be told which portfolio to look at.
function authorize_portfolio(email, requested_portfolio)
{
    var scope = resolve_caller_scope(email);

    if (!scope)
    {
        return { ok: false, error: "unknown or unauthenticated user" };
    }

    if (normalize(scope.allowed) === "all")
    {
        if (!requested_portfolio)
        {
            return { ok: false, error: "portfolio is required for this account" };
        }
        return { ok: true, portfolio: requested_portfolio, scope: scope };
    }

    if (requested_portfolio && normalize(requested_portfolio) !== normalize(scope.allowed))
    {
        return { ok: false, error: "not authorized for portfolio: " + requested_portfolio };
    }

    return { ok: true, portfolio: scope.allowed, scope: scope };
}

// --------------------------------------------------------------------
// web app entry points
// --------------------------------------------------------------------

function doPost(e)
{
    var body;

    try
    {
        body = JSON.parse(e.postData.contents);
    }
    catch (err)
    {
        return error_response("bad json body");
    }

    var action = body.action;

    if (action === "login")                return json_response(handle_login(body));
    if (action === "get_roster")           return json_response(handle_get_roster(body));
    if (action === "mark_attendance")      return json_response(handle_mark_attendance(body));
    if (action === "get_attendance")       return json_response(handle_get_attendance(body));
    if (action === "get_applicants")       return json_response(handle_get_applicants(body));
    if (action === "get_applicant_by_cms") return json_response(handle_get_applicant_by_cms(body));
    if (action === "add_review")           return json_response(handle_add_review(body));
    if (action === "get_reviews")          return json_response(handle_get_reviews(body));

    return error_response("unknown action: " + action);
}

function doGet(e)
{
    return json_response({ ok: true, message: "NSVS backend is alive" });
}

// --------------------------------------------------------------------
// login  ->  validates credentials, returns the caller's scope so the
//            frontend knows immediately what it is and isn't allowed
//            to ask for on every later call.
// --------------------------------------------------------------------

function handle_login(body)
{
    var email    = normalize(body.email);
    var password = String(body.password || "");

    var accounts = read_sheet_as_objects(get_sheet(SHEET_LOGIN), [0, 1]);

    for (var i = 0; i < accounts.length; i++)
    {
        var acc = accounts[i];

        if (normalize(acc["Email"]) === email && String(acc["Password"]) === password)
        {
            var scope = resolve_caller_scope(email);
            return {
                ok: true,
                name:        scope.name,
                designation: scope.designation,
                home_portfolio: scope.home_portfolio,
                allowed_portfolio: scope.allowed   // "all", or exactly one portfolio
            };
        }
    }

    return { ok: false, error: "invalid email or password" };
}

// --------------------------------------------------------------------
// roster
// --------------------------------------------------------------------

function handle_get_roster(body)
{
    var auth = authorize_portfolio(body.email, body.portfolio);
    if (!auth.ok)
    {
        return auth;
    }

    var rows = read_sheet_as_objects(get_sheet(SHEET_OC), [0, 1]);
    var portfolio_n = normalize(auth.portfolio);

    var members = rows.filter(function (r)
    {
        return normalize(r["Portfolio"]) === portfolio_n;
    });

    return { ok: true, portfolio: auth.portfolio, members: members };
}

// --------------------------------------------------------------------
// attendance
// --------------------------------------------------------------------

function handle_mark_attendance(body)
{
    var auth = authorize_portfolio(body.email, body.portfolio);
    if (!auth.ok)
    {
        return auth;
    }

    var sheet = get_sheet(SHEET_ATTENDANCE);
    var records = body.records || [];

    for (var i = 0; i < records.length; i++)
    {
        var rec = records[i];
        append_row(sheet, [body.date, auth.portfolio, rec.cms_id, rec.name, rec.status, auth.scope.name]);
    }

    return { ok: true, written: records.length };
}

function handle_get_attendance(body)
{
    var auth = authorize_portfolio(body.email, body.portfolio);
    if (!auth.ok)
    {
        return auth;
    }

    var rows = read_sheet_as_objects(get_sheet(SHEET_ATTENDANCE), []);
    var portfolio_n = normalize(auth.portfolio);

    var filtered = rows.filter(function (r)
    {
        return normalize(r["Portfolio"]) === portfolio_n;
    });

    return { ok: true, portfolio: auth.portfolio, records: filtered };
}

// --------------------------------------------------------------------
// applicants
// --------------------------------------------------------------------

function handle_get_applicants(body)
{
    var auth = authorize_portfolio(body.email, body.portfolio);
    if (!auth.ok)
    {
        return auth;
    }

    if (auth.scope.designation !== "Director" && auth.scope.designation !== "Deputy Director")
    {
        return { ok: false, error: "only directors review applicants" };
    }

    var rows = read_sheet_as_objects(get_sheet(SHEET_APPLICANTS), []);
    var portfolio_n = normalize(auth.portfolio);

    var filtered = rows.filter(function (r)
    {
        return normalize(r["1st preference"]) === portfolio_n || normalize(r["2nd preference"]) === portfolio_n;
    });

    return { ok: true, portfolio: auth.portfolio, applicants: filtered };
}

function handle_get_applicant_by_cms(body)
{
    var scope = resolve_caller_scope(body.email);
    if (!scope)
    {
        return { ok: false, error: "unknown or unauthenticated user" };
    }

    var cms_id = clean_cms_id(body.cms_id);
    var rows = read_sheet_as_objects(get_sheet(SHEET_APPLICANTS), []);

    for (var i = 0; i < rows.length; i++)
    {
        var candidate = clean_cms_id(rows[i]["Registration Number"]);
        if (candidate && candidate === cms_id)
        {
            var applicant = rows[i];

            if (normalize(scope.allowed) !== "all")
            {
                var pref1 = normalize(applicant["1st preference"]);
                var pref2 = normalize(applicant["2nd preference"]);
                var allowed_n = normalize(scope.allowed);

                if (pref1 !== allowed_n && pref2 !== allowed_n)
                {
                    return { ok: false, error: "applicant did not apply to your portfolio" };
                }
            }

            return { ok: true, applicant: applicant };
        }
    }

    return { ok: false, error: "no applicant found for that cms id" };
}

function clean_cms_id(raw)
{
    var s = String(raw || "");
    var match = s.match(/\d{6,}/);
    return match ? match[0].substring(0, 6) : null;
}

// --------------------------------------------------------------------
// reviews
// --------------------------------------------------------------------

function handle_add_review(body)
{
    var auth = authorize_portfolio(body.email, body.portfolio);
    if (!auth.ok)
    {
        return auth;
    }

    if (auth.scope.designation !== "Director" && auth.scope.designation !== "Deputy Director")
    {
        return { ok: false, error: "only directors can add reviews" };
    }

    var sheet = get_sheet(SHEET_REVIEWS);
    var timestamp = Utilities.formatDate(new Date(), "GMT+5", "yyyy-MM-dd HH:mm:ss");

    append_row(sheet, [
        body.cms_id,
        auth.portfolio,
        auth.scope.name,
        body.review_text,
        body.recommendation,
        timestamp
    ]);

    return { ok: true };
}

function handle_get_reviews(body)
{
    var scope = resolve_caller_scope(body.email);
    if (!scope)
    {
        return { ok: false, error: "unknown or unauthenticated user" };
    }

    var cms_id = clean_cms_id(body.cms_id);
    var rows = read_sheet_as_objects(get_sheet(SHEET_REVIEWS), []);

    var filtered = rows.filter(function (r)
    {
        if (clean_cms_id(r["CMS ID"]) !== cms_id)
        {
            return false;
        }
        if (normalize(scope.allowed) === "all")
        {
            return true;
        }
        return normalize(r["Portfolio"]) === normalize(scope.allowed);
    });

    return { ok: true, reviews: filtered };
}
