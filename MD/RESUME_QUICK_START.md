# Resume Upload Feature - Quick Start Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create or update `.env` file:
```env
GEMINI_API_KEY=your_google_gemini_api_key
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760
```

### 3. Create Uploads Directory
```bash
mkdir -p uploads
```

### 4. Optional: Install OCR Support
For scanned PDF and image support (recommended):

**Windows:**
```bash
choco install tesseract
```

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### 5. Start the Application
```bash
cd backend
python run.py

# In another terminal, start frontend
npm run dev
```

## Using the Feature

### For Students (in Profile Page)

1. Navigate to **Profile** → **Resume Upload & AI Skill Extraction**
2. Upload your resume file:
   - Drag and drop, or
   - Click to select file
3. Supported formats: PDF, DOCX, TXT, PNG, JPG (max 10MB)
4. Wait for processing (5-10 seconds)
5. View extracted:
   - ✅ Skills (technical + soft)
   - ✅ Name, email, phone
   - ✅ Experience history
   - ✅ Education history
   - ✅ Professional summary

### Skills are automatically saved to profile

The extracted skills will:
- Appear in your skill list
- Be used for team matching
- Help with skill assessments
- Show categorization (technical/soft)

## API Testing

### Test Resume Upload Endpoint

```bash
# 1. Get JWT token from login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password"
  }'

# Copy the token from response

# 2. Upload resume
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample_resume.pdf"

# Response will include:
# - skillsExtracted: number of skills found
# - skills: dict with all extracted skills
# - resumeData: name, email, experience, education, etc.
```

## Supported File Formats

| Format | Support | Speed | Quality |
|--------|---------|-------|---------|
| PDF (text) | ✅ Full | Fast | Excellent |
| PDF (scanned) | ✅ Full | Slow | Good |
| DOCX | ✅ Full | Fast | Excellent |
| DOC | ✅ Full | Fast | Good |
| TXT | ✅ Full | Fast | Good |
| PNG/JPG | ✅ Full | Slow | Good |

## What Gets Extracted

### Skills
- **Technical Skills**: Programming languages, frameworks, tools
- **Soft Skills**: Communication, leadership, teamwork, etc.
- **All Skills**: Complete list from resume

Each skill includes:
- Name
- Level (beginner/intermediate/advanced)
- Category (technical/soft)
- Source (marked as "resume")

### Resume Data
- **Name**: Full name
- **Email**: Contact email
- **Phone**: Phone number
- **Summary**: Professional summary (2-3 sentences)
- **Experience**: Job history with company, position, duration, description
- **Education**: Schools/universities with degree, field, graduation year
- **Certifications**: Professional certifications listed

## Example Response

```json
{
  "success": true,
  "message": "Resume processed successfully",
  "data": {
    "skillsExtracted": 20,
    "skills": {
      "python": {
        "name": "Python",
        "level": "intermediate",
        "category": "technical",
        "source": "resume"
      },
      "react": {
        "name": "React",
        "level": "advanced",
        "category": "technical",
        "source": "resume"
      },
      "communication": {
        "name": "Communication",
        "level": "intermediate",
        "category": "soft",
        "source": "resume"
      }
    },
    "resumeData": {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+1 555 123 4567",
      "summary": "Full-stack developer with 5+ years of experience building scalable web applications",
      "experience": [
        {
          "company": "Tech Innovations Inc",
          "position": "Senior Full Stack Developer",
          "duration": "2021-Present",
          "description": "Led development of microservices architecture using Python and React"
        },
        {
          "company": "Digital Solutions Ltd",
          "position": "Full Stack Developer",
          "duration": "2019-2021",
          "description": "Developed and maintained multiple client-facing web applications"
        }
      ],
      "education": [
        {
          "institution": "MIT",
          "degree": "Bachelor of Science",
          "field": "Computer Science",
          "year": "2019"
        }
      ]
    }
  }
}
```

## Troubleshooting

### Common Issues & Solutions

**Q: "File type not allowed"**
- A: Only PDF, DOCX, DOC, TXT, PNG, JPG are supported
- Check file extension and try again

**Q: "File is too large"**
- A: Maximum file size is 10MB
- Compress your resume PDF or remove large images

**Q: "Unable to extract text from PDF"**
- A: Install OCR support: `pip install pytesseract pdf2image`
- Your PDF might be scanned/image-based

**Q: "Error calling Gemini API"**
- A: Check GEMINI_API_KEY environment variable
- Ensure API key has quota available
- Verify internet connection

**Q: Skills not showing after upload**
- A: Refresh the page or check browser console for errors
- Try uploading again with a different resume

**Q: "pytesseract not installed" error**
- A: Install it: `pip install pytesseract`
- Also need to install Tesseract OCR application separately

## Performance Tips

1. **Use text-based PDFs**: Faster than scanned PDFs (~2 sec vs ~10 sec)
2. **Use standard resume format**: Better extraction accuracy
3. **Keep file size under 5MB**: Faster processing
4. **Clear resume text**: Remove images/unusual fonts for better extraction

## File Location

Uploaded resumes are stored in: `backend/uploads/`

Filename format: `{user_id}_{timestamp}_{original_name}`

Example: `507f1f77bcf86cd799439011_20260113_085430_john_resume.pdf`

## Next Steps

After uploading your resume:

1. ✅ Your profile is updated with extracted skills
2. ✅ Skills are used for team matching
3. ✅ Skills appear in your skill list
4. ✅ You can take skill assessments
5. ✅ You can form or join teams

## Support & Questions

If you encounter issues:

1. Check `RESUME_UPLOAD_FEATURE.md` for detailed documentation
2. Check error message in the UI or browser console
3. See troubleshooting section above
4. Review backend logs at `backend/run.py` output

## Architecture Diagram

```
Frontend                    Backend                 AI Service
┌──────────────┐           ┌──────────────────┐    ┌─────────────┐
│ Resume File  │──POST──→  │ /api/resumes/    │    │   Gemini    │
│              │           │    upload        │    │     AI      │
└──────────────┘           │                  │    └─────────────┘
       ▲                    │ 1. Validate file │          ▲
       │                    │ 2. Save to disk  │          │
       │                    │ 3. Extract text  │    Send text,
       │                    │ 4. Call AI API ──────┤ Get JSON
       │                    │ 5. Update user   │          │
       │                    │    profile       │          │
       │                    │ 6. Return data   │          │
       │                    └──────────────────┘    │
       │                           │                │
       └─── Response with     MongoDB              │
            extracted skills   (User profile)   ─→ ┘
            & resume data
```

## Data Security

✅ Files stored server-side in `uploads/` directory
✅ JWT authentication required
✅ API key never exposed to frontend
✅ File access restricted to authenticated users
✅ Sensitive data not logged

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Production Ready
