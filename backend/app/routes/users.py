from flask import Blueprint, jsonify, request

bp = Blueprint("users", __name__)


@bp.get("/<user_id>")
def get_user(user_id: str):
    return jsonify({"message": "get_user not implemented", "userId": user_id}), 501


@bp.get("/<user_id>/skill-status")
def skill_status(user_id: str):
    return jsonify({"message": "skill_status not implemented", "userId": user_id}), 501
