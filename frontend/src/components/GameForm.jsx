// src/components/GameForm.jsx - Add / Edit game modal

import { useState, useEffect } from "react";

const EMPTY = { title: "", cover_url: "", status: "planned", rating: "" };

export default function GameForm({ initial, onSave, onCancel, loading }) {
    const [form, setForm] = useState(EMPTY);

    useEffect(() => {
        setForm(
            initial
                ? { ...initial, cover_url: initial.cover_url || "", rating: initial.rating ?? "" }
                : EMPTY
        );
    }, [initial]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            title: form.title.trim(),
            cover_url: form.cover_url.trim() || null,
            status: form.status,
            rating: form.rating !== "" ? Number(form.rating) : null,
        };
        onSave(payload);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initial ? "Edit Game" : "Add Game"}</h2>
                    <button className="icon-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={submit} className="game-form">
                    <div className="field">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={set("title")}
                            placeholder="e.g. Elden Ring"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Cover Image URL</label>
                        <input
                            type="url"
                            value={form.cover_url}
                            onChange={set("cover_url")}
                            placeholder="https://..."
                        />
                        {form.cover_url && (
                            <img src={form.cover_url} alt="preview" className="cover-preview" />
                        )}
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label>Status</label>
                            <select value={form.status} onChange={set("status")}>
                                <option value="planned">Planned</option>
                                <option value="playing">Playing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Rating</label>
                            <select value={form.rating} onChange={set("rating")}>
                                <option value="">—</option>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {"★".repeat(n)}{"☆".repeat(5 - n)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-ghost" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Saving..." : initial ? "Save Changes" : "Add Game"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
