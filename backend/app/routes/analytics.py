from flask import Blueprint, jsonify, request

bp = Blueprint("analytics", __name__)


@bp.get("/overview")
def analytics_overview():
    return jsonify({"message": "analytics_overview not implemented"}), 501
