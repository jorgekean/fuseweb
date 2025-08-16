
export const redirectUrl = () => {
    var currentURL = window.location.href;
    var returnURL = "";

    if (currentURL.includes("localhost")) {
        returnURL = "http://localhost:5173/";
    } else if (currentURL.includes("fusewebv2")) {
        returnURL = "https://fusewebv2.azurewebsites.net/";
    } else if (currentURL.includes("fuse-qa")) {
        returnURL = "https://fuse-qa.bdaout-test.ehr.com/";
    } else {
        returnURL = " https://fuse.bdaout.ehr.com/";
    }

    return returnURL;
}

export const apiUrl = () => {
    var currentURL = window.location.href;
    var returnURL = "";

    if (currentURL.includes("localhost")) {
        returnURL = "https://localhost:7045/api";
    } else if (currentURL.includes("fuse-qa")) {
        returnURL = "https://fuse-qa.bdaout-test.ehr.com/api";
    } else {
        returnURL = " https://fuse.bdaout.ehr.com/api";
    }

    return returnURL;
}

// list of emails, with admin access
export const adminEmails: string[] = [
    "jorge.kean.de.los.reyes@towerswatson.com",
    "alvin.roy.manzano@towerswatson.com",
    "carleen.tolentino@towerswatson.com",
    "gab.libanan@towerswatson.com",
    "kim.dolores@towerswatson.com",
    "krufferjohn.luche@towerswatson.com",
    "shari.andres@towerswatson.com",
]


export const timeOptions = [30, 60, 120, 180, 240];

export interface Holiday {
    Date: Date;
    Holiday: string;
    HolidayType: "Legal" | "Special";
}

export const YearlyHoliday: Holiday[] = [
    { Date: new Date(2025, 0, 1), Holiday: "New Year's Day", HolidayType: "Legal" },
    { Date: new Date(2025, 0, 29), Holiday: "Chinese New year", HolidayType: "Special" },
    { Date: new Date(2025, 3, 1), Holiday: "Eid’l Fitr (Feast of Rama...", HolidayType: "Legal" },
    { Date: new Date(2025, 3, 9), Holiday: "Araw ng Kagitingan", HolidayType: "Legal" },
    { Date: new Date(2025, 3, 17), Holiday: "Maundy Thursday", HolidayType: "Legal" },
    { Date: new Date(2025, 3, 18), Holiday: "Good Friday", HolidayType: "Legal" },
    { Date: new Date(2025, 3, 19), Holiday: "Black Saturday", HolidayType: "Special" },
    { Date: new Date(2025, 4, 1), Holiday: "Labor Day", HolidayType: "Legal" },
    { Date: new Date(2025, 4, 12), Holiday: "Election day (special hol...", HolidayType: "Special" },
    { Date: new Date(2025, 5, 6), Holiday: "Regular Holiday", HolidayType: "Legal" },
    { Date: new Date(2025, 5, 12), Holiday: "Independence Day", HolidayType: "Legal" },
    { Date: new Date(2025, 7, 21), Holiday: "Ninoy Aquino Day", HolidayType: "Special" },
    { Date: new Date(2025, 7, 25), Holiday: "National Heros Day", HolidayType: "Legal" },
    { Date: new Date(2025, 9, 31), Holiday: "All Saint's Day eve", HolidayType: "Special" },
    { Date: new Date(2025, 10, 1), Holiday: "All Saints Day", HolidayType: "Special" },
    { Date: new Date(2025, 10, 30), Holiday: "Bonifacio Day", HolidayType: "Legal" },
    { Date: new Date(2025, 11, 8), Holiday: "FEAST OF IMMACULATE CONCE...", HolidayType: "Special" },
    { Date: new Date(2025, 11, 24), Holiday: "Christmas Eve", HolidayType: "Special" },
    { Date: new Date(2025, 11, 25), Holiday: "Christmas Day", HolidayType: "Legal" },
    { Date: new Date(2025, 11, 30), Holiday: "Rizal Day", HolidayType: "Legal" },
    { Date: new Date(2025, 11, 31), Holiday: "Last day of the year", HolidayType: "Special" },
];