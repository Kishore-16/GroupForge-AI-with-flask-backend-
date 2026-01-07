import os
from flask import Flask
from .config import Config
from .extensions import cors, jwt, mongo
from .errors import register_error_handlers


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config())

    # Init extensions
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})
    jwt.init_app(app)
    mongo.init_app(app)

    # Register blueprints
    from .routes import auth, users, resumes, assessments, teams, analytics

    app.register_blueprint(auth.bp, url_prefix="/api/auth")
    app.register_blueprint(users.bp, url_prefix="/api/users")
    app.register_blueprint(resumes.bp, url_prefix="/api/resumes")
    app.register_blueprint(assessments.bp, url_prefix="/api/assessments")
    app.register_blueprint(teams.bp, url_prefix="/api/teams")
    app.register_blueprint(analytics.bp, url_prefix="/api/analytics")

    register_error_handlers(app)
    return app
