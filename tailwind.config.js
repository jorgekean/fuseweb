module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: 'class', // or 'media' for OS-level dark mode
    safelist: [
        { pattern: /(primary|primary2|primary3|primary4|primary5|secondary|secondary2|secondary3|secondary4|secondary5|navigation|navigationtext|fusedarktext|fuselighttext)/ },
    ],
    theme: {        
        extend: {
            colors: {
                primary: "var(--primary)",
                primary2: "var(--primary2)",
                primary3: "var(--primary3)",
                primary4: "var(--primary4)",
                primary5: "var(--primary5)",
                secondary: "var(--secondary)",
                secondary2: "var(--secondary2)",
                secondary3: "var(--secondary3)",
                secondary4: "var(--secondary4)",
                secondary5: "var(--secondary5)",
                navigation: "var(--navigation)",
                navigationtext: "var(--navigationtext)",
                fusedarktext: "var(--fusedarktext)",
                fuselighttext: "var(--fuselighttext)",
              },
        },
    },
    plugins: [],
};