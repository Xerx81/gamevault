"""
JWT utility helpers for GameVault auth.
"""

import jwt
import datetime
from datetime import timezone
from functools import wraps
from typing import Callable, Any
from flask import request, jsonify, current_app


SECRET = "dev-secret-change-in-prod-must-be-32b!"
ALGORITHM = "HS256"
TOKEN_EXP_HOURS = 24


def generate_token(user_id: int) -> str:
    """Generate a signed JWT for the given user_id."""
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.now(timezone.utc) + datetime.timedelta(hours=TOKEN_EXP_HOURS),
        "iat": datetime.datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises jwt.exceptions on failure."""
    return jwt.decode(token, SECRET, algorithms=[ALGORITHM])


def token_required(f: Callable) -> Callable:
    """Decorator: requires valid Bearer token. Injects current_user_id into kwargs."""

    @wraps(f)
    def decorated(*args: Any, **kwargs: Any):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed token"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        kwargs["current_user_id"] = payload["user_id"]
        return f(*args, **kwargs)

    return decorated
