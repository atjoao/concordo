"use client";

import React, { createContext, useContext, useState } from "react";
import { Theme, themes } from "./Themes.styles";

type ThemeAction = {
    theme: Theme | null;
    setTheme: React.Dispatch<React.SetStateAction<Theme | null>>;
};

const ThemeContext = createContext<ThemeAction | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme | null>(null);

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme: () => ThemeAction = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("ThemeProvider não foi usado.");
    }
    return context;
};
