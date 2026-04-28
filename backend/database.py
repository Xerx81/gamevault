"""
Database initialization and helper utilities for GameVault.
Uses SQLite with row_factory for dict-like access.
"""

import sqlite3
from flask import Flask, g, current_app


def get_db() -> sqlite3.Connection:
    """Get or create a database connection for the current request context."""
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e: Exception | None = None) -> None:
    """Close the database connection at end of request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT UNIQUE NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    igdb_id     INTEGER,
    title       TEXT NOT NULL,
    cover_url   TEXT,
    status      TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','playing','completed')),
    rating      INTEGER CHECK(rating BETWEEN 1 AND 5),
    date_added  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""


def init_db(app: Flask) -> None:
    """Initialize database schema and register teardown."""
    app.teardown_appcontext(close_db)

    with app.app_context():
        db = get_db()
        db.executescript(SCHEMA)
        db.commit()
