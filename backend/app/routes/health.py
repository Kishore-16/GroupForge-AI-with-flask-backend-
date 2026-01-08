from flask import Blueprint, jsonify

bp = Blueprint("health", __name__, url_prefix="/api/health")

@bp.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "OK",
        "message": "Backend is connected successfully 🚀"
    }), 200
