// src/components/GameForm.jsx - Add / Edit game modal

import { useState, useEffect } from "react";
import { api } from "../utils/api"; // Import the search function

const EMPTY = { title: "", cover_url: "", status: "planned", rating: "", igdb_id: null };

export default function GameForm({ initial, onSave, onCancel, loading }) {
    const [form, setForm] = useState(EMPTY);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (initial) {
            setForm({ ...initial, rating: initial.rating ?? "" });
            setQuery(initial.title);
        } else {
            setForm(EMPTY);
            setQuery("");
        }
    }, [initial]);

    // Handle searching when user types
    useEffect(() => {
        if (query.length < 3 || form.igdb_id) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await api.searchIGDB(query);
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Wait 500ms after typing stops to call API

        return () => clearTimeout(delayDebounceFn);
    }, [query, form.igdb_id]);

    const selectGame = (game) => {
        // Construct the IGDB Image URL
        const imgUrl = game.cover 
            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
            : null;

        setForm({
            ...form,
            title: game.name,
            cover_url: imgUrl,
            igdb_id: game.id
        });
        setQuery(game.name);
        setResults([]); // Clear results after selection
    };

    const submit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            title: form.title || query, // fallback to query if not selected from list
            rating: form.rating !== "" ? Number(form.rating) : null,
        });
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initial ? "Edit Game" : "Add Game"}</h2>
                    <button className="icon-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={submit} className="game-form">
                    <div className="field" style={{ position: 'relative' }}>
                        <label>Search Title *</label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setForm(f => ({ ...f, igdb_id: null })); // Reset ID if user changes text
                            }}
                            placeholder="Type to search..."
                            required
                            autoComplete="off"
                        />
                        
                        {/* Search Results Dropdown */}
                        {results.length > 0 && (
                            <ul className="search-results">
                                {results.map((game) => (
                                    <li key={game.id} onClick={() => selectGame(game)}>
                                        {game.name} ({new Date(game.first_release_date * 1000).getFullYear() || 'N/A'})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {isSearching && <small>Searching...</small>}
                    </div>

                    <div className="field">
                        <label>Cover Preview</label>
                        {form.cover_url ? (
                            <img src={form.cover_url} alt="preview" className="cover-preview" />
                        ) : (
                            <div className="no-cover">No cover selected</div>
                        )}
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label>Status</label>
                            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                                <option value="planned">Planned</option>
                                <option value="playing">Playing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Rating</label>
                            <select value={form.rating} onChange={(e) => setForm({...form, rating: e.target.value})}>
                                <option value="">—</option>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>{"★".repeat(n)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Saving..." : initial ? "Save Changes" : "Add to Vault"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
