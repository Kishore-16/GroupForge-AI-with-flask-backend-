import os
import json
from typing import Dict, List, Any
from datetime import datetime
from flask import current_app
from werkzeug.utils import secure_filename
import requests
from PIL import Image
import io

# PDF and document handling
try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    from pdf2image import convert_from_bytes
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False

try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False


ALLOWED_EXTENSIONS = {'pdf', 'txt', 'docx', 'doc', 'png', 'jpg', 'jpeg'}


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    text = ""
    errors = []

    # Try using pypdf first
    if HAS_PYPDF:
        try:
            pdf_reader = PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            if text.strip():
                return text
        except Exception as e:
            errors.append(f"pypdf: {e}")
            print(f"Error extracting text with pypdf: {e}")

    # Try pdfplumber (pure Python, no external binaries needed)
    if HAS_PDFPLUMBER:
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                plumber_text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        plumber_text += page_text + "\n"
            if plumber_text.strip():
                return plumber_text
        except Exception as e:
            errors.append(f"pdfplumber: {e}")
            print(f"Error extracting text with pdfplumber: {e}")

    # Fallback: use pdf2image and OCR (requires Poppler + Tesseract binaries)
    if HAS_PDF2IMAGE and HAS_PYTESSERACT:
        try:
            images = convert_from_bytes(file_content)
            for image in images:
                text += pytesseract.image_to_string(image) + "\n"
            if text.strip():
                return text
        except Exception as e:
            errors.append(f"pdf2image/pytesseract: {e}")
            print(f"Error extracting text with pdf2image/pytesseract: {e}")

    error_detail = "; ".join(errors) if errors else "No PDF parsers available"
    raise Exception(
        f"Unable to extract text from PDF. "
        f"Install 'pdfplumber' for best results (pip install pdfplumber). "
        f"Details: {error_detail}"
    )


def extract_text_from_image(file_content: bytes) -> str:
    """Extract text from image using OCR"""
    if not HAS_PYTESSERACT:
        raise Exception("pytesseract not installed. Cannot process images.")
    
    try:
        image = Image.open(io.BytesIO(file_content))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from image: {e}")


def extract_text_from_file(file_path: str) -> str:
    """Extract text from uploaded resume file"""
    filename = os.path.basename(file_path)
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    with open(file_path, 'rb') as f:
        file_content = f.read()
    
    if ext == 'pdf':
        return extract_text_from_pdf(file_content)
    
    elif ext in {'png', 'jpg', 'jpeg'}:
        return extract_text_from_image(file_content)
    
    elif ext in {'txt'}:
        return file_content.decode('utf-8', errors='ignore')
    
    elif ext in {'doc', 'docx'}:
        # For docx files, we'll use a simple approach
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_content))
            return '\n'.join([para.text for para in doc.paragraphs])
        except ImportError:
            raise Exception("python-docx not installed. Cannot process DOCX files.")
    
    else:
        raise Exception(f"Unsupported file format: {ext}")


def extract_skills_from_resume(resume_text: str) -> Dict[str, Any]:
    """
    Use OpenRouter AI to extract skills from resume text
    Returns dict with extracted skills and structured resume data
    """
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise Exception("OPENROUTER_API_KEY not found in environment variables")
    
    prompt = f"""You are an expert resume parser and skill extractor. 
    
Analyze the following resume text and extract all technical and soft skills mentioned.
Also extract the person's name, email, education, experience, and other relevant details.

Resume Text:
---
{resume_text}
---

Return a JSON object with this EXACT structure (nothing else, just JSON):
{{
    "name": "Full name if available, otherwise 'Not found'",
    "email": "Email if available, otherwise 'Not found'",
    "phone": "Phone if available, otherwise 'Not found'",
    "summary": "A brief professional summary (2-3 sentences)",
    "skills": [
        "Skill 1",
        "Skill 2",
        "Skill 3"
    ],
    "technical_skills": [
        "Programming Language/Tool 1",
        "Programming Language/Tool 2"
    ],
    "soft_skills": [
        "Soft skill 1",
        "Soft skill 2"
    ],
    "experience": [
        {{
            "company": "Company name",
            "position": "Job title",
            "duration": "Duration period",
            "description": "Brief description"
        }}
    ],
    "education": [
        {{
            "institution": "School/University name",
            "degree": "Degree name",
            "field": "Field of study",
            "year": "Graduation year"
        }}
    ],
    "certifications": ["Certification 1", "Certification 2"]
}}

IMPORTANT: Return ONLY valid JSON, no other text. If a field is not found in the resume, use empty array [] or 'Not found' as appropriate."""

    try:
        # Call OpenRouter API
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://groupforge.ai",
            "X-Title": "GroupForge AI Resume Parser"
        }
        
        payload = {
            "model": "nvidia/nemotron-3-nano-30b-a3b:free",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 4096
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
        
        response_data = response.json()
        response_text = response_data['choices'][0]['message']['content'].strip()
        
        # Parse JSON from response
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
        else:
            json_str = response_text
        
        parsed_data = json.loads(json_str)
        return parsed_data
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response as JSON: {e}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error calling OpenRouter API: {e}")
    except Exception as e:
        raise Exception(f"Error processing resume: {e}")


def save_resume(file_storage, user_id: str):
    """Save uploaded resume file to uploads folder"""
    if not file_storage or file_storage.filename == '':
        raise ValueError("No file selected")
    
    if not allowed_file(file_storage.filename):
        raise ValueError(f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Create uploads directory if it doesn't exist
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Secure the filename
    filename = secure_filename(file_storage.filename)
    
    # Add user_id and timestamp to filename for uniqueness
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    filename = f"{user_id}_{timestamp}_{filename}"
    
    file_path = os.path.join(upload_folder, filename)
    file_storage.save(file_path)
    
    return file_path


def process_resume_file(file) -> Dict[str, Any]:
    """
    Process resume file: extract text and skills using AI
    Accepts a werkzeug FileStorage object
    Returns dict with extracted skills and resume data
    """
    # Read file content
    file_content = file.read()
    file.seek(0)  # Reset file pointer
    
    # Get file extension
    filename = secure_filename(file.filename)
    file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # Extract text based on file type
    if file_ext == 'pdf':
        resume_text = extract_text_from_pdf(file_content)
    elif file_ext == 'txt':
        resume_text = file_content.decode('utf-8', errors='ignore')
    elif file_ext in ['docx', 'doc']:
        resume_text = extract_text_from_docx(file_content)
    elif file_ext in ['png', 'jpg', 'jpeg']:
        resume_text = extract_text_from_image(file_content)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")
    
    if not resume_text or len(resume_text.strip()) < 50:
        raise ValueError("Resume text is too short or empty. Please upload a valid resume.")
    
    # Extract skills using AI
    parsed_data = extract_skills_from_resume(resume_text)
    
    # Enrich with processed timestamp
    parsed_data['processedAt'] = datetime.utcnow().isoformat()
    
    return parsed_data


def enqueue_resume_job(user_id: str, file_path: str):
    """Create a resume processing job (legacy function for compatibility)"""
    # This can be used if you want to implement async job processing with a queue
    raise NotImplementedError("Use process_resume_file for synchronous processing")
