// src/hooks/useAuth.js - Auth state management

import { useState, useEffect, createContext, useContext } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("gv_token");
        if (!token) { setLoading(false); return; }
        api.me()
            .then(setUser)
            .catch(() => localStorage.removeItem("gv_token"))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const data = await api.login(email, password);
        localStorage.setItem("gv_token", data.token);
        setUser(data.user);
    };

    const signup = async (username, email, password) => {
        const data = await api.signup(username, email, password);
        localStorage.setItem("gv_token", data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("gv_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
