# Resume Upload Feature - Configuration & Deployment Guide

## Environment Configuration

### Development Environment (.env)

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/groupforge?retryWrites=true&w=majority
MONGO_DB_NAME=groupforge

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Google Gemini AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760  # 10MB in bytes

# Optional: Tesseract OCR Path (Windows)
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### Production Environment (.env.production)

```env
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=generate-secure-random-key
JWT_SECRET_KEY=generate-secure-random-key

# MongoDB Configuration
MONGO_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/groupforge?retryWrites=true&w=majority
MONGO_DB_NAME=groupforge

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Google Gemini AI Configuration
GEMINI_API_KEY=your_production_api_key

# File Upload Configuration
UPLOAD_FOLDER=/var/uploads  # Absolute path
MAX_CONTENT_LENGTH=10485760  # 10MB

# Optional: Cloud Storage (if using AWS S3)
AWS_S3_BUCKET=groupforge-resumes
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

## Backend Configuration Files

### Flask Config (backend/app/config.py)

Current configuration already supports the feature:

```python
import os

class Config:
    DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/groupforge")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))
```

**To customize:**

```python
# backend/app/config.py

import os
from datetime import timedelta

class Config:
    # ... existing config ...
    
    # Resume Upload Settings
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))
    
    # Resume allowed file extensions
    ALLOWED_EXTENSIONS: set = {'pdf', 'txt', 'docx', 'doc', 'png', 'jpg', 'jpeg'}
    
    # Resume processing settings
    MIN_RESUME_TEXT_LENGTH: int = 50  # Minimum characters to process
    AI_PROCESSING_TIMEOUT: int = 30  # seconds
    
    # File storage settings
    UPLOAD_DATE_FORMAT: str = "%Y%m%d_%H%M%S"
    
    # Gemini AI Settings
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.3
    GEMINI_TOP_P: float = 0.9
    GEMINI_MAX_TOKENS: int = 4096
```

## Nginx Configuration for File Uploads

### nginx.conf (Updated)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Maximum upload size
    client_max_body_size 10M;

    # ... other config ...

    # Protect uploads directory from direct access
    location /uploads {
        # Option 1: Deny all
        deny all;
        
        # Option 2: Serve with authentication
        # auth_request /api/auth/verify;
    }

    # API endpoints
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        
        # Headers for file uploads
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Docker Configuration

### Dockerfile.backend (Updated)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for document processing
RUN apt-get update && apt-get install -y \
    gcc \
    tesseract-ocr \
    libpoppler-cpp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Run application
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "--bind", "0.0.0.0:5000", "backend.run:app"]
```

### docker-compose.yml (Updated)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MONGO_URI=${MONGO_URI}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - UPLOAD_FOLDER=/app/uploads
      - MAX_CONTENT_LENGTH=10485760
    volumes:
      # Persist uploads directory
      - resume_uploads:/app/uploads
      - ./backend:/app/backend
    depends_on:
      - mongo
    networks:
      - groupforge

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
      - VITE_API_URL=http://backend:5000
    networks:
      - groupforge

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
    networks:
      - groupforge

volumes:
  mongo_data:
  resume_uploads:

networks:
  groupforge:
    driver: bridge
```

## AWS S3 Integration (Optional)

For cloud-based resume storage:

### backend/app/services/storage_service.py

```python
import boto3
import os
from datetime import datetime
from typing import Tuple

class S3StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            region_name=os.getenv('AWS_S3_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.bucket = os.getenv('AWS_S3_BUCKET', 'groupforge-resumes')

    def upload_resume(self, file_content: bytes, user_id: str, filename: str) -> Tuple[str, str]:
        """
        Upload resume to S3
        Returns: (s3_key, s3_url)
        """
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        s3_key = f"resumes/{user_id}/{timestamp}_{filename}"
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=s3_key,
                Body=file_content,
                ContentType='application/pdf',
                Metadata={
                    'user_id': user_id,
                    'uploaded_at': datetime.utcnow().isoformat()
                }
            )
            
            # Generate URL
            url = f"s3://{self.bucket}/{s3_key}"
            return s3_key, url
            
        except Exception as e:
            raise Exception(f"Failed to upload to S3: {str(e)}")

    def download_resume(self, s3_key: str) -> bytes:
        """Download resume from S3"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket,
                Key=s3_key
            )
            return response['Body'].read()
        except Exception as e:
            raise Exception(f"Failed to download from S3: {str(e)}")
```

## Monitoring & Logging

### Logging Configuration

```python
# backend/app/__init__.py

import logging
from logging.handlers import RotatingFileHandler
import os

def configure_logging(app):
    """Configure application logging"""
    
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    # Resume processing logs
    resume_handler = RotatingFileHandler(
        'logs/resume_processing.log',
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    
    resume_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    
    resume_handler.setLevel(logging.INFO)
    
    # Add handler to app logger
    app.logger.addHandler(resume_handler)
    app.logger.setLevel(logging.INFO)
    
    app.logger.info('Resume processing logging initialized')
```

### Example Log Output

```
2026-01-13 10:30:45,123 INFO: Resume upload started for user 507f1f77bcf86cd799439011
2026-01-13 10:30:45,234 INFO: File saved to: uploads/507f1f77bcf86cd799439011_20260113_103045_resume.pdf
2026-01-13 10:30:45,456 INFO: Text extraction completed: 1245 characters
2026-01-13 10:31:15,789 INFO: AI processing completed: 18 skills extracted
2026-01-13 10:31:16,012 INFO: User profile updated with new skills
2026-01-13 10:31:16,234 INFO: Resume processing completed successfully
```

## Performance Tuning

### Backend Optimization

```python
# backend/app/config.py - Add these settings

# Resume processing
RESUME_PROCESSING_THREADS = 4  # Parallel uploads
RESUME_TEXT_MAX_LENGTH = 100000  # Maximum characters to process
AI_BATCH_SIZE = 5  # Process resumes in batches

# Caching
RESUME_CACHE_TTL = 3600  # 1 hour
SKILL_EXTRACTION_CACHE = True
```

### Database Optimization

```javascript
// MongoDB indexes for resume operations

db.users.createIndex({ "resumeData.processedAt": -1 })
db.users.createIndex({ "skills": 1 })
db.users.createIndex({ "_id": 1, "resumeData.filePath": 1 })

// Create collection for resume jobs (if implementing async)
db.createCollection("resume_jobs")
db.resume_jobs.createIndex({ "userId": 1, "createdAt": -1 })
db.resume_jobs.createIndex({ "status": 1 })
```

## Security Hardening

### CORS Configuration

```python
# backend/app/__init__.py

from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv("CORS_ORIGINS", "").split(","),
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range"],
        "max_age": 3600
    }
})
```

### File Upload Security

```python
# backend/app/routes/resumes.py - Security checks

def upload_resume():
    # 1. Verify file size
    if request.content_length > current_app.config['MAX_CONTENT_LENGTH']:
        return jsonify({"success": False, "message": "File too large"}), 413
    
    # 2. Verify file type
    file = request.files['file']
    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Invalid file type"}), 400
    
    # 3. Check file magic number (first few bytes)
    file_header = file.read(4)
    file.seek(0)
    
    valid_headers = {
        b'%PDF': 'pdf',
        b'\xff\xd8\xff': 'jpg',
        b'\x89PNG': 'png'
    }
    
    is_valid = any(file_header.startswith(h) for h in valid_headers)
    if not is_valid and file.filename.endswith('.pdf'):
        return jsonify({"success": False, "message": "Invalid file"}), 400
    
    # Continue processing...
```

### Rate Limiting

```python
# backend/app/__init__.py

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Apply to resume endpoint
@bp.route("/upload", methods=["POST"])
@limiter.limit("10 per hour")  # Prevent abuse
@jwt_required()
def upload_resume():
    # ...
```

## Deployment Checklist

- [ ] Set secure `SECRET_KEY` and `JWT_SECRET_KEY` in production
- [ ] Set valid `GEMINI_API_KEY` with proper quotas
- [ ] Create `uploads` directory with proper permissions (755)
- [ ] Configure MongoDB backups
- [ ] Set up logging and monitoring
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure file upload size limits at nginx level
- [ ] Test resume upload with various file types
- [ ] Monitor AI API usage and costs
- [ ] Set up error alerts
- [ ] Document API endpoints for team

## Troubleshooting Deployment Issues

### Issue: "Permission denied" for uploads folder
```bash
# Fix: Set proper permissions
mkdir -p uploads
chmod 755 uploads
```

### Issue: "Out of space" in uploads
```bash
# Cleanup old uploads (older than 30 days)
find uploads -type f -mtime +30 -delete
```

### Issue: Gemini API quota exceeded
```
Solution: 
1. Check API key quotas in Google Cloud Console
2. Request quota increase
3. Implement caching to reduce API calls
```

---

**Configuration Version**: 1.0
**Last Updated**: January 2026
