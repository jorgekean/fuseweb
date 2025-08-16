import React, { createContext, useContext, useEffect, useState } from 'react';
import themes, { ThemeKey } from '../../theme.config';
interface ThemeContextType {
    theme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeKey>(() => {
        return (localStorage.getItem('fuse-theme') as ThemeKey) || 'WTWBrand';
    });

    const updateTheme = (newTheme: ThemeKey) => {
        setTheme(newTheme);
        localStorage.setItem('fuse-theme', newTheme);

        // Apply CSS variables for the selected theme
        const root = document.documentElement;
        const themeColors = themes[newTheme];
        Object.entries(themeColors).forEach(([key, value]) => {
            if (key !== 'name') {
                root.style.setProperty(`--${key}`, value as string);
            }
        });
    };

    useEffect(() => {
        // Initialize theme on component mount
        updateTheme(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
