from flask import Blueprint, jsonify, request

bp = Blueprint("resumes", __name__, url_prefix="/api/resumes")


@bp.route("/upload", methods=["POST"])
def upload_resume():
    """
    Upload resume and start processing job
    """
    return jsonify({
        "success": False,
        "message": "upload_resume not implemented yet"
    }), 501


@bp.route("/<job_id>", methods=["GET"])
def resume_job_status(job_id: str):
    """
    Check resume processing job status
    """
    return jsonify({
        "success": False,
        "message": "resume_job_status not implemented yet",
        "jobId": job_id
    }), 501

