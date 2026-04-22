// src/components/GameCard.jsx - Single game card

const STATUS_META = {
    planned:   { label: "Planned",   color: "#6b7280" },
    playing:   { label: "Playing",   color: "#f59e0b" },
    completed: { label: "Completed", color: "#10b981" },
};

function Stars({ rating }) {
    if (!rating) return <span className="no-rating">Not rated</span>;
    return (
        <span className="stars" title={`${rating}/5`}>
            {"★".repeat(rating)}
            <span className="stars-empty">{"★".repeat(5 - rating)}</span>
        </span>
    );
}

export default function GameCard({ game, onEdit, onDelete }) {
    const meta = STATUS_META[game.status] || STATUS_META.planned;
    const date = new Date(game.date_added).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });

    return (
        <div className="game-card">
            <div className="card-cover">
                {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} loading="lazy" />
                ) : (
                        <div className="cover-placeholder">
                            <span>◈</span>
                        </div>
                    )}
                <span className="status-badge" style={{ background: meta.color }}>
                    {meta.label}
                </span>
            </div>

            <div className="card-body">
                <h3 className="card-title" title={game.title}>{game.title}</h3>
                <Stars rating={game.rating} />
                <p className="card-date">Added {date}</p>
            </div>

            <div className="card-actions">
                <button className="btn-icon edit" onClick={() => onEdit(game)} title="Edit">
                    ✎
                </button>
                <button className="btn-icon delete" onClick={() => onDelete(game)} title="Delete">
                    ✕
                </button>
            </div>
        </div>
    );
}
