from flask import Blueprint, jsonify, request

bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@bp.route("/overview", methods=["GET"])
def analytics_overview():
    """
    Get analytics overview data
    """
    return jsonify({
        "success": False,
        "message": "analytics_overview not implemented yet"
    }), 501

