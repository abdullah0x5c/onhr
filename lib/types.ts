export type AttendanceStatus = "Present" | "Absent" | "Leave";
export type Recommendation = "Recommended" | "Backup" | "Not Recommended";

export type ApiError = {
    ok: false;
    error: string;
};

export type LoginSuccess = {
    ok: true;
    name: string;
    designation: string;
    home_portfolio: string;
    allowed_portfolio: string;
};

export type Member = {
    Wing: string;
    Portfolio: string;
    Designation: string;
    "Full Name": string;
    Gender: string;
    "Contact No.": string;
    "Email Address": string;
    "CMS ID": string;
    Batch: number;
    Department: string;
    "Residential Status": string;
    Hostel: string;
};

export type RosterResponse = {
    ok: true;
    portfolio: string;
    members: Member[];
};

export type AttendanceRecord = {
    cms_id: string;
    name: string;
    status: AttendanceStatus;
};

export type MarkAttendanceResponse = {
    ok: true;
    written: number;
};

export type AttendanceHistoryRow = {
    Date: string;
    Portfolio: string;
    "CMS ID": string;
    Name: string;
    Status: string;
    "Marked By": string;
};

export type AttendanceHistoryResponse = {
    ok: true;
    portfolio: string;
    records: AttendanceHistoryRow[];
};

export type Applicant = Record<string, string | number>;

export type ApplicantsResponse = {
    ok: true;
    portfolio: string;
    applicants: Applicant[];
};

export type ApplicantByCmsResponse = {
    ok: true;
    applicant: Applicant;
};

export type ReviewRow = {
    "CMS ID": string;
    Portfolio: string;
    Reviewer: string;
    "Review Text": string;
    Recommendation: string;
    Timestamp: string;
};

export type ReviewsResponse = {
    ok: true;
    reviews: ReviewRow[];
};

export type AddReviewResponse = {
    ok: true;
};

export type SessionUser = {
    email: string;
    name: string;
    designation: string;
    home_portfolio: string;
    allowed_portfolio: string;
    selected_portfolio: string | null;
};

export type LoginRequest = {
    action: "login";
    email: string;
    password: string;
};

export type GetRosterRequest = {
    action: "get_roster";
    email: string;
    portfolio?: string;
};

export type MarkAttendanceRequest = {
    action: "mark_attendance";
    email: string;
    portfolio: string;
    date: string;
    records: AttendanceRecord[];
};

export type GetAttendanceRequest = {
    action: "get_attendance";
    email: string;
    portfolio?: string;
};

export type GetApplicantsRequest = {
    action: "get_applicants";
    email: string;
    portfolio?: string;
};

export type GetApplicantByCmsRequest = {
    action: "get_applicant_by_cms";
    email: string;
    cms_id: string;
};

export type AddReviewRequest = {
    action: "add_review";
    email: string;
    portfolio: string;
    cms_id: string;
    review_text: string;
    recommendation: Recommendation;
};

export type GetReviewsRequest = {
    action: "get_reviews";
    email: string;
    cms_id: string;
};

export type ApiRequest =
    | LoginRequest
    | GetRosterRequest
    | MarkAttendanceRequest
    | GetAttendanceRequest
    | GetApplicantsRequest
    | GetApplicantByCmsRequest
    | AddReviewRequest
    | GetReviewsRequest;

export type ApiSuccess =
    | LoginSuccess
    | RosterResponse
    | MarkAttendanceResponse
    | AttendanceHistoryResponse
    | ApplicantsResponse
    | ApplicantByCmsResponse
    | ReviewsResponse
    | AddReviewResponse;

export type ApiResponse = ApiSuccess | ApiError;
