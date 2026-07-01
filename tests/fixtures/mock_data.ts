import type {
    Applicant,
    AttendanceHistoryRow,
    LoginSuccess,
    Member,
    ReviewRow,
} from "@/lib/types";

export const API_URL_PATTERN = /script\.google\.com\/macros\/s\//;

export const MOCK_DIRECTOR_MARKETING: LoginSuccess = {
    ok: true,
    name: "Ayesha Baig",
    designation: "Director",
    home_portfolio: "Marketing",
    allowed_portfolio: "Marketing",
};

export const MOCK_HR_EXECUTIVE: LoginSuccess = {
    ok: true,
    name: "Iqra Baig",
    designation: "HR Executive",
    home_portfolio: "Human Resources",
    allowed_portfolio: "Marketing",
};

export const MOCK_HR_DIRECTOR_ALL: LoginSuccess = {
    ok: true,
    name: "Ahmad Baig",
    designation: "Director",
    home_portfolio: "Human Resources",
    allowed_portfolio: "all",
};

export const MOCK_ROSTER: Member[] = [
    {
        Wing: "Executive Council",
        Portfolio: "Marketing",
        Designation: "Director",
        "Full Name": "Iram Nazish",
        Gender: "Female",
        "Contact No.": "03461288950",
        "Email Address": "iram.nazish24@student.nust.edu.pk",
        "CMS ID": "512825",
        Batch: 2024,
        Department: "SCME",
        "Residential Status": "Internal Hostelite",
        Hostel: "Amna",
    },
    {
        Wing: "Executive Council",
        Portfolio: "Marketing",
        Designation: "Executive",
        "Full Name": "Muhammad Touseef Akhtar",
        Gender: "Male",
        "Contact No.": "03001234567",
        "Email Address": "touseef@student.nust.edu.pk",
        "CMS ID": "460700",
        Batch: 2023,
        Department: "SEECS",
        "Residential Status": "Day Scholar",
        Hostel: "",
    },
];

export const MOCK_ATTENDANCE_HISTORY: AttendanceHistoryRow[] = [
    {
        Date: "2026-06-16",
        Portfolio: "Marketing",
        "CMS ID": "512825",
        Name: "Iram Nazish",
        Status: "Present",
        "Marked By": "Ayla Asgher",
    },
];

export const MOCK_APPLICANT: Applicant = {
    Timestamp: "2026-05-14 10:22:00",
    "Email Address": "applicant@student.nust.edu.pk",
    Name: "Test Applicant",
    "Phone Number": "03001234567",
    "Registration Number": "512340",
    Batch: 2024,
    School: "SEECS",
    "1st preference": "Marketing",
    "2nd preference": "Finance",
    "Why do you want to be a part of NCBS?": "I want to contribute to society events.",
};

export const MOCK_APPLICANTS: Applicant[] = [MOCK_APPLICANT];

export const MOCK_REVIEWS: ReviewRow[] = [
    {
        "CMS ID": "512340",
        Portfolio: "Marketing",
        Reviewer: "Iram Nazish",
        "Review Text": "Strong communicator.",
        Recommendation: "Recommended",
        Timestamp: "2026-06-10 14:02:11",
    },
];

export type MockCredentials = {
    username: string;
    password: string;
    login: LoginSuccess;
};

export const MOCK_CREDENTIALS: Record<string, MockCredentials> = {
    director: {
        username: "dirmarketing",
        password: "test123",
        login: MOCK_DIRECTOR_MARKETING,
    },
    hr_executive: {
        username: "hr1",
        password: "test123",
        login: MOCK_HR_EXECUTIVE,
    },
    hr_director: {
        username: "dirhr",
        password: "test123",
        login: MOCK_HR_DIRECTOR_ALL,
    },
};
