"use client";

import { createContext, useContext, useState } from "react";

interface ErrorContextValue {
    error: string;
    setError: (error: string) => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
    const [error, setError] = useState<string>("");

    return (
        <ErrorContext.Provider value={{ error, setError }}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const ctx = useContext(ErrorContext);
    if (!ctx) {
        throw new Error("useError must be used within ErrorProvider");
    }
    return ctx;
}
