import os


class Config:
    DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/groupforge")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))
