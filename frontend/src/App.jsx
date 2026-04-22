// src/App.jsx - Root app with auth routing

import { AuthProvider, useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function AppInner() {
    const { user, loading } = useAuth();
    if (loading) return <div className="splash">◈</div>;
    return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppInner />
        </AuthProvider>
    );
}
