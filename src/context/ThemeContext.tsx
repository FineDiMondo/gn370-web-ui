import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ThemeType = '370' | 'risorgimentale' | 'palermitano' | 'veronese';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>('370');

    useEffect(() => {
        // Detect system preference
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemPreference(darkModeQuery.matches ? 'dark' : 'light');

        // Check local storage on initial load
        const savedTheme = localStorage.getItem('gn370-theme') as ThemeType | null;

        if (savedTheme) {
            // User has explicit theme preference
            setThemeState(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Use system preference: dark → '370', light → 'palermitano'
            const defaultTheme = darkModeQuery.matches ? '370' : 'palermitano';
            setThemeState(defaultTheme);
            document.documentElement.setAttribute('data-theme', defaultTheme);
        }

        // Listen for system preference changes
        const handleChange = (e: MediaQueryListEvent) => {
            // Check system preference
            
            // If user hasn't explicitly set a theme, follow system preference
            if (!localStorage.getItem('gn370-theme')) {
                const newTheme = e.matches ? '370' : 'palermitano';
                setThemeState(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        };

        darkModeQuery.addEventListener('change', handleChange);
        return () => darkModeQuery.removeEventListener('change', handleChange);
    }, []);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        localStorage.setItem('gn370-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
