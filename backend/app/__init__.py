from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

from app.extensions import cors, jwt, mongo
from app.routes import auth, users, resumes, assessments, teams, analytics, health


def create_app():
    app = Flask(__name__)

    # ===============================
    # Basic Configuration
    # ===============================
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/groupforge")

    # ===============================
    # Initialize Extensions
    # ===============================
    cors.init_app(app)
    jwt.init_app(app)
    mongo.init_app(app)
    CORS(app)

    # ===============================
    # Register Blueprints (Routes)
    # ===============================
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(resumes.bp)
    app.register_blueprint(assessments.bp)
    app.register_blueprint(teams.bp)
    app.register_blueprint(analytics.bp)
    app.register_blueprint(health.bp)

    # ===============================
    # Root Test Route (Optional)
    # ===============================
    @app.route("/")
    def index():
        return {"message": "GroupForge Backend is running 🚀"}, 200

    return app
