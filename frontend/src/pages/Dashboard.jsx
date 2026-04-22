// src/pages/Dashboard.jsx - Main game collection dashboard

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../utils/api";
import GameCard from "../components/GameCard";
import GameForm from "../components/GameForm";

const FILTERS = ["all", "planned", "playing", "completed"];

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [games, setGames] = useState([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [formState, setFormState] = useState(null); // null | { game?: obj }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadGames = useCallback(async () => {
        try {
            const data = await api.getGames();
            setGames(data);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => { loadGames(); }, [loadGames]);

    const handleSave = async (payload) => {
        setSaving(true);
        setError("");
        try {
            if (formState?.game) {
                const updated = await api.updateGame(formState.game.id, payload);
                setGames((g) => g.map((x) => (x.id === updated.id ? updated : x)));
            } else {
                const created = await api.addGame(payload);
                setGames((g) => [created, ...g]);
            }
            setFormState(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.deleteGame(deleteTarget.id);
            setGames((g) => g.filter((x) => x.id !== deleteTarget.id));
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    const visible = games.filter((g) => {
        const matchFilter = filter === "all" || g.status === filter;
        const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: games.length,
        planned: games.filter((g) => g.status === "planned").length,
        playing: games.filter((g) => g.status === "playing").length,
        completed: games.filter((g) => g.status === "completed").length,
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dash-header">
                <div className="dash-brand">
                    <span className="brand-icon">◈</span>
                    <span>GameVault</span>
                </div>
                <div className="dash-user">
                    <span>@{user?.username}</span>
                    <button className="btn-ghost small" onClick={logout}>Sign Out</button>
                </div>
            </header>

            {/* Stats bar */}
            <div className="stats-bar">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`stat-pill ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        <span className="pill-label">{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                        <span className="pill-count">{counts[f]}</span>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-wrap">
                    <span className="search-icon">⌕</span>
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>
                <button className="btn-primary" onClick={() => setFormState({})}>
                    + Add Game
                </button>
            </div>

            {error && <p className="dash-error">{error} <button onClick={() => setError("")}>✕</button></p>}

            {/* Game grid */}
            {visible.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">◈</span>
                    <p>{games.length === 0 ? "No games yet. Add your first one!" : "No games match your filter."}</p>
                    {games.length === 0 && (
                        <button className="btn-primary" onClick={() => setFormState({})}>Add Game</button>
                    )}
                </div>
            ) : (
                    <div className="game-grid">
                        {visible.map((game) => (
                            <GameCard
                                key={game.id}
                                game={game}
                                onEdit={(g) => setFormState({ game: g })}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>
                )}

            {/* Add/Edit modal */}
            {formState !== null && (
                <GameForm
                    initial={formState.game}
                    onSave={handleSave}
                    onCancel={() => setFormState(null)}
                    loading={saving}
                />
            )}

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <h2>Delete Game?</h2>
                        <p>Remove <strong>{deleteTarget.title}</strong> from your collection?</p>
                        <div className="form-actions">
                            <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
