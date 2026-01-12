from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.team_service import TeamService

bp = Blueprint("teams", __name__, url_prefix="/api/teams")

team_service = TeamService()


@bp.route("/eligible-students", methods=["GET"])
@jwt_required()
def get_eligible_students():
    """
    Get all students eligible for team formation
    (profileCompleted=true, attendedTest=true, inTeam=false)
    """
    try:
        students = team_service.get_eligible_students()

        return jsonify({
            "success": True,
            "data": students,
            "count": len(students)
        }), 200

    except Exception as e:
        import traceback
        error_details = {
            "message": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"ERROR in get_eligible_students: {error_details['message']}")
        print(error_details['traceback'])
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@bp.route("/form", methods=["POST"])
@jwt_required()
def form_team():
    try:
        payload = request.get_json()
        faculty_id = get_jwt_identity()

        team = team_service.form_team(payload, faculty_id)

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
@jwt_required()
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


@bp.route("/my-team", methods=["GET"])
@jwt_required()
def get_my_team():
    """
    Get the team for the currently authenticated student.
    Returns team details with member information.
    """
    try:
        student_id = get_jwt_identity()
        team = team_service.get_student_team(student_id)

        if team is None:
            return jsonify({
                "success": True,
                "data": None,
                "message": "Not assigned to any team"
            }), 200

        return jsonify({
            "success": True,
            "data": team
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@bp.route("/<team_id>", methods=["GET"])
@jwt_required()
def get_team_by_id(team_id):
    """
    Get a specific team by its ID.
    """
    try:
        team = team_service.get_team_by_id(team_id)

        if team is None:
            return jsonify({
                "success": False,
                "error": "Team not found"
            }), 404

        return jsonify({
            "success": True,
            "data": team
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

