// src/pages/AuthPage.jsx - Sign in / Sign up

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
    const { login, signup } = useAuth();
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));


    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "login") {
                await login(form.email, form.password);
            } else {
                await signup(form.username, form.email, form.password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode((m) => (m === "login" ? "signup" : "login"));
        setError("");
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <span className="brand-icon">◈</span>
                    <h1>GameVault</h1>
                    <p>Your personal game collection</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={mode === "login" ? "tab active" : "tab"}
                        onClick={() => setMode("login")}
                    >
                        Sign In
                    </button>
                    <button
                        className={mode === "signup" ? "tab active" : "tab"}
                        onClick={() => setMode("signup")}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={submit} className="auth-form">
                    {mode === "signup" && (
                        <div className="field">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="your_handle"
                                value={form.username}
                                onChange={set("username")}
                                required
                                autoComplete="username"
                            />
                        </div>
                    )}

                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={set("email")}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={set("password")}
                            required
                            minLength={6}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    {mode === "login" ? "No account?" : "Already have one?"}{" "}
                    <button onClick={switchMode} className="link-btn">
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
