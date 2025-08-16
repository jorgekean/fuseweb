const themes = {
    FuseOriginal: {
        name: "FuseOriginal",
        primary: "#0e7490",
        primary2: "#06b6d4",
        primary3: "#38bdf8",
        primary4: "#bae6fd",
        primary5: "#e0f2fe",
        secondary: "#c2410c",
        secondary2: "#f97316",
        secondary3: "#fdba74",
        secondary4: "#fed7aa",
        secondary5: "#FFFBF7",
        navigation: "#ffffff",
        navigationtext: "#0e7490",
        fuselighttext: "#FAFCFF",
        fusedarktext: "#001736",
    },
    WTWPurple: {
        name: "WTWPurple",
        primary: "#48086f",
        primary2: "#7f35b2",
        primary3: "#c2a8f0",
        primary4: "#d8c6f5",
        primary5: "#efe2fa",
        secondary: "#9e0085",
        secondary2: "#c900ac",
        secondary3: "#e377dc",
        secondary4: "#f0bde6",
        secondary5: "#FFFAFE",
        navigation: "#ffffff",
        navigationtext: "#48086f",
        fuselighttext: "#FDFBFF",
        fusedarktext: "#280144",
    },
    WTWGreen: {
        name: "WTWGreen",
        primary: "#15494C",// infinity-700
        primary2: "#1B6768",// infinity-600
        primary3: "#208382",// infinity-500
        primary4: "#51E0D0",//infinity-200
        primary5: "#DFF9F6",// infinity-50
        secondary: "#27C2B6", // infinity-300
        secondary2: "#29D5C4",// infinity-250
        secondary3: "#90EBE1",// infinity-150
        secondary4: "#C3F4EF",// infinity-100
        secondary5: "#ECFCFA",// inmfinty-25
        // navigation: "#ffffff",
        // navigationtext: "#007d61",
        // fuselighttext: "#F6FDFC",
        // fusedarktext: "#091A1C",
        navigation: "#15494C",
        navigationtext: "#F6FDFC",
        fuselighttext: "#F6FDFC",
        fusedarktext: "#091A1C",
    },
    WTWBrand: {
        name: "WTWBrand",
        primary: "#48086f",
        primary2: "#7f35b2",
        primary3: "#c2a8f0",
        primary4: "#d8c6f5",
        primary5: "#efe2fa",
        secondary: "#9e0085",
        secondary2: "#c900ac",
        secondary3: "#e377dc",
        secondary4: "#f0bde6",
        secondary5: "#FFFAFE",
        navigation: "#48086f",
        navigationtext: "#FFFAFE",
        fuselighttext: "#FDFBFF",
        fusedarktext: "#280144",
    },
} as const;

export type ThemeKey = keyof typeof themes;
export default themes;
