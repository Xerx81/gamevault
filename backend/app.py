"""
GameVault API - Flask backend for game collection tracker.
Run: python app.py
"""

from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.auth import auth_bp
from routes.games import games_bp


def create_app(database: str = "gamevault.db") -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev-secret-change-in-prod-must-be-32b!"
    app.config["DATABASE"] = database

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    init_db(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(games_bp, url_prefix="/api/games")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
