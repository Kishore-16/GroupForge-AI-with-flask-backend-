from flask import Flask
from flask_cors import CORS

import os
from dotenv import load_dotenv

# Load .env from project root even when running from backend/ directory
ROOT_ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(ROOT_ENV_PATH)

from app.extensions import cors, jwt, mongo, socketio
from app.routes import auth, users, resumes, assessments, teams, analytics, health


def create_app():
    app = Flask(__name__)
    
    # Disable automatic trailing slash redirects that cause CORS issues
    app.url_map.strict_slashes = False

    # ===============================
    # Basic Configuration
    # ===============================
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/groupforge")

    # ===============================
    # Initialize Extensions FIRST
    # ===============================
    # Initialize CORS with simple configuration
    CORS(app, 
         origins="*",
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False)
    
    jwt.init_app(app)
    mongo.init_app(app)
    socketio.init_app(app)

    # Import WebSocket handlers to register events
    from app import websocket_handlers

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
    # CORS Handler for all responses
    # ===============================
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
        return response
    
    # ===============================
    # Handle OPTIONS requests explicitly
    # ===============================
    @app.before_request
    def handle_preflight():
        from flask import request
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            return response

    # ===============================
    # Root Test Route (Optional)
    # ===============================
    @app.route("/")
    def index():
        return {"message": "GroupForge Backend is running 🚀"}, 200

    return app
