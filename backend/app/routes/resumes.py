from flask import Blueprint, jsonify, request
from werkzeug.exceptions import RequestEntityTooLarge
import os
import traceback
from dotenv import load_dotenv
from ..services.resume_service import (
    process_resume_file,
    allowed_file
)

load_dotenv()

bp = Blueprint("resumes", __name__, url_prefix="/api/resumes")


@bp.route("/upload", methods=["POST"])
def upload_resume():
    """
    Upload resume and extract skills using AI
    - File is saved to uploads folder
    - Resume text is extracted
    - OpenRouter AI extracts skills from the resume
    - Skills are returned in response
    """
    try:
        # Check if file is in request
        if 'resume' not in request.files:
            return jsonify({
                "success": False,
                "error": "No file part in the request"
            }), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "File type not allowed. Supported: PDF, TXT, DOCX, PNG, JPG, JPEG"
            }), 400
        
        # Process resume and extract skills
        resume_data = process_resume_file(file)
        
        # Build the response with the expected format
        # 'technical_skills' from AI = programming languages/tools → displayed as Skills (with proficiency)
        # 'skills' from AI = soft/general skills → displayed as Tools & Technologies
        detected_skills = resume_data.get('technical_skills', [])
        detected_tools = resume_data.get('skills', [])
        
        # Create confidence scores for each skill/tool
        confidence_scores = {}
        for skill in detected_skills:
            confidence_scores[skill] = 0.85  # Default confidence
        for tool in detected_tools:
            confidence_scores[tool] = 0.90   # Tools have higher confidence
        
        return jsonify({
            "success": True,
            "data": {
                "detectedSkills": detected_skills,
                "detectedTools": detected_tools,
                "confidenceScores": confidence_scores,
                "name": resume_data.get('name'),
                "email": resume_data.get('email'),
                "summary": resume_data.get('summary', '')
            }
        }), 200
        
    except RequestEntityTooLarge:
        print("Error: File too large")
        return jsonify({
            "success": False,
            "error": "File is too large. Maximum size is 10MB"
        }), 413
    
    except ValueError as e:
        error_msg = str(e)
        print(f"ValueError: {error_msg}")
        return jsonify({
            "success": False,
            "error": error_msg
        }), 400
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error uploading resume: {traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"Error processing resume: {error_msg}"
        }), 500


@bp.route("/<job_id>", methods=["GET"])
def resume_job_status(job_id: str):
    """
    Check resume processing job status (legacy endpoint for async support)
    """
    try:
        # This endpoint would be used if implementing async job processing
        # For now, we're using synchronous processing in the upload endpoint
        return jsonify({
            "success": False,
            "message": "This endpoint is for future async job processing"
        }), 501
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error checking job status: {str(e)}"
        }), 500


