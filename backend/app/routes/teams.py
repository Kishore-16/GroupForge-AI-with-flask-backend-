from flask import Blueprint, jsonify, request
from app.services.team_service import TeamService

bp = Blueprint("teams", __name__, url_prefix="/api/teams")

team_service = TeamService()


@bp.route("/form", methods=["POST"])
def form_team():
    try:
        payload = request.get_json()

        team = team_service.form_team(payload)

        return jsonify({
            "success": True,
            "message": "Team created successfully",
            "data": team
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@bp.route("/", methods=["GET"])
def list_teams():
    try:
        teams = team_service.list_teams()

        return jsonify({
            "success": True,
            "data": teams
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

