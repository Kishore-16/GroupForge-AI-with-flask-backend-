
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.assessment_service import AssessmentService

bp = Blueprint("assessments", __name__, url_prefix="/api/assessments")
assessment_service = AssessmentService()


@bp.route("/start", methods=["POST"])
@jwt_required()
def start_assessment():
    """
    Start a new assessment session
    """
    return jsonify({
        "success": False,
        "message": "start_assessment not implemented yet"
    }), 501


@bp.route("/<session_id>/submit", methods=["POST"])
@jwt_required()
def submit_assessment(session_id: str):
    """
    Submit answers for an assessment session
    """
    return jsonify({
        "success": False,
        "message": "submit_assessment not implemented yet",
        "sessionId": session_id
    }), 501


@bp.route("/complete", methods=["POST"])
@jwt_required()
def complete_assessment():
    """
    Complete an assessment and update user profile with scores
    Expected JSON body:
    {
        "skills": { "python": 75, "ml": 80, ... },
        "overallScore": 77.5
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'skills' not in data:
            return jsonify({
                "success": False,
                "message": "Skills data is required"
            }), 400

        result, status_code = assessment_service.complete_assessment(
            user_id=user_id,
            skills=data.get('skills', {}),
            overall_score=data.get('overallScore', 0)
        )

        return jsonify(result), status_code

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500
