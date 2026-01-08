from flask import Blueprint, jsonify, request

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.route("/<user_id>", methods=["GET"])
def get_user(user_id: str):
    """
    Get user profile by ID
    """
    return jsonify({
        "success": False,
        "message": "get_user not implemented yet",
        "userId": user_id
    }), 501


@bp.route("/<user_id>/skill-status", methods=["GET"])
def skill_status(user_id: str):
    """
    Get user's skill status
    """
    return jsonify({
        "success": False,
        "message": "skill_status not implemented yet",
        "userId": user_id
    }), 501

