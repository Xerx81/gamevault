"""
Games routes: CRUD for user game collection.
All endpoints require JWT auth.

GET    /api/games          - list all games for user
POST   /api/games          - add new game
PUT    /api/games/<id>     - update game
DELETE /api/games/<id>     - delete game
"""

from flask import Blueprint, request, jsonify
from database import get_db
from auth_utils import token_required
from igdb_utils import search_games

games_bp = Blueprint("games", __name__)

VALID_STATUSES = {"planned", "playing", "completed"}


def _game_row_to_dict(row) -> dict:
    """Convert sqlite3.Row to plain dict."""
    return {
        "id": row["id"],
        "title": row["title"],
        "cover_url": row["cover_url"],
        "status": row["status"],
        "rating": row["rating"],
        "date_added": row["date_added"],
    }


@games_bp.route("", methods=["GET"])
@token_required
def list_games(current_user_id: int):
    """
    List all games for authenticated user.

    Returns: [ { id, title, cover_url, status, rating, date_added } ]
    """
    db = get_db()
    rows = db.execute(
        "SELECT * FROM games WHERE user_id = ? ORDER BY date_added DESC",
        (current_user_id,),
    ).fetchall()
    return jsonify([_game_row_to_dict(r) for r in rows])


@games_bp.route("", methods=["POST"])
@token_required
def add_game(current_user_id: int):
    """
    Add a new game to collection.

    Body: { title, cover_url?, status?, rating? }
    Returns: created game object
    """
    data: dict = request.get_json(silent=True) or {}

    title: str = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    cover_url: str | None = data.get("cover_url") or None
    status: str = data.get("status") or "planned"
    if status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    rating = data.get("rating")
    if rating is not None:
        try:
            rating = int(rating)
            if not 1 <= rating <= 5:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({"error": "rating must be integer 1-5"}), 400

    db = get_db()
    cursor = db.execute(
        "INSERT INTO games (user_id, title, cover_url, status, rating) VALUES (?, ?, ?, ?, ?)",
        (current_user_id, title, cover_url, status, rating),
    )
    db.commit()

    row = db.execute("SELECT * FROM games WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify(_game_row_to_dict(row)), 201


@games_bp.route("/<int:game_id>", methods=["PUT"])
@token_required
def update_game(current_user_id: int, game_id: int):
    """
    Update a game. Only owner can update.

    Body: { title?, cover_url?, status?, rating? }
    Returns: updated game object
    """
    db = get_db()
    row = db.execute("SELECT * FROM games WHERE id = ? AND user_id = ?", (game_id, current_user_id)).fetchone()
    if not row:
        return jsonify({"error": "Game not found"}), 404

    data: dict = request.get_json(silent=True) or {}

    title: str = (data.get("title") or row["title"]).strip()
    cover_url: str | None = data.get("cover_url", row["cover_url"])
    status: str = data.get("status") or row["status"]
    if status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    rating = data.get("rating", row["rating"])
    if rating is not None:
        try:
            rating = int(rating)
            if not 1 <= rating <= 5:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({"error": "rating must be integer 1-5"}), 400

    db.execute(
        "UPDATE games SET title=?, cover_url=?, status=?, rating=? WHERE id=?",
        (title, cover_url, status, rating, game_id),
    )
    db.commit()

    updated = db.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
    return jsonify(_game_row_to_dict(updated))


@games_bp.route("/<int:game_id>", methods=["DELETE"])
@token_required
def delete_game(current_user_id: int, game_id: int):
    """
    Delete a game. Only owner can delete.

    Returns: { message: "deleted" }
    """
    db = get_db()
    row = db.execute("SELECT id FROM games WHERE id = ? AND user_id = ?", (game_id, current_user_id)).fetchone()
    if not row:
        return jsonify({"error": "Game not found"}), 404

    db.execute("DELETE FROM games WHERE id = ?", (game_id,))
    db.commit()
    return jsonify({"message": "deleted"})


@games_bp.route("/search", methods=["GET"])
@token_required
def search_igdb(current_user_id: int):
    """
    Search for games.

    Returns: [ { id, title, cover_url, status, rating, date_added } ]
    """
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "search query parameter 'q' is required"}), 400

    try:
        games = search_games(query)
        return jsonify(games)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
