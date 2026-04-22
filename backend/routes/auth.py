"""
Auth routes: /api/auth/signup, /api/auth/login, /api/auth/me
"""

from flask import Blueprint, request, jsonify
import bcrypt
from database import get_db
from auth_utils import generate_token, token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Register a new user.

    Body: { username, email, password }
    Returns: { token, user: { id, username, email } }
    """
    data: dict = request.get_json(silent=True) or {}

    username: str = (data.get("username") or "").strip()
    email: str = (data.get("email") or "").strip().lower()
    password: str = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email, password required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed: bytes = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (username, email, hashed.decode()),
        )
        db.commit()
        user_id: int = cursor.lastrowid
    except Exception:
        return jsonify({"error": "Username or email already exists"}), 409

    token = generate_token(user_id)
    return jsonify({"token": token, "user": {"id": user_id, "username": username, "email": email}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate a user.

    Body: { email, password }
    Returns: { token, user: { id, username, email } }
    """
    data: dict = request.get_json(silent=True) or {}
    email: str = (data.get("email") or "").strip().lower()
    password: str = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    db = get_db()
    row = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not row or not bcrypt.checkpw(password.encode(), row["password"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(row["id"])
    return jsonify({
        "token": token,
        "user": {"id": row["id"], "username": row["username"], "email": row["email"]},
    })


@auth_bp.route("/me", methods=["GET"])
@token_required
def me(current_user_id: int):
    """
    Get current authenticated user info.

    Returns: { id, username, email }
    """
    db = get_db()
    row = db.execute("SELECT id, username, email FROM users WHERE id = ?", (current_user_id,)).fetchone()
    if not row:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(row))
