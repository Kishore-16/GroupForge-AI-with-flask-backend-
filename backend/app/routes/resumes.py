from flask import Blueprint, jsonify, request

bp = Blueprint("resumes", __name__)


@bp.post("/upload")
def upload_resume():
    return jsonify({"message": "upload_resume not implemented"}), 501


@bp.get("/<job_id>")
def resume_job_status(job_id: str):
    return jsonify({"message": "resume_job_status not implemented", "jobId": job_id}), 501
