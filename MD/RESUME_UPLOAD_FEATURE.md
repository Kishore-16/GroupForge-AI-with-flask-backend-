# Resume Upload & AI Skill Extraction Feature

## Overview

This feature enables users to upload their resume files, and uses Google Gemini AI to automatically extract skills and other relevant information from the resume. The extracted skills are then saved to the user's profile, helping with better team matching and skill assessments.

## Supported File Formats

- **PDF** (.pdf) - Primary format
- **Word Documents** (.docx, .doc)
- **Text** (.txt)
- **Images** (.png, .jpg, .jpeg) - OCR-enabled
- **Maximum File Size**: 10MB

## Technical Architecture

### Backend Components

#### 1. Resume Service (`backend/app/services/resume_service.py`)

The core service handles all resume processing operations:

**Key Functions:**

- `allowed_file(filename)` - Validates file extensions
- `extract_text_from_pdf(file_content)` - Extracts text from PDFs using pypdf or OCR
- `extract_text_from_image(file_content)` - Extracts text from images using Tesseract OCR
- `extract_text_from_file(file_path)` - Routes file to appropriate extractor based on type
- `extract_skills_from_resume(resume_text)` - Uses Google Gemini AI to extract structured data
- `save_resume(file_storage, user_id)` - Saves file to uploads folder
- `process_resume_file(file_path, user_id)` - Orchestrates the full processing pipeline

**Dependencies:**
```
pypdf>=4.1.0           # PDF text extraction
pdf2image>=1.16.0      # PDF to image conversion for OCR
pytesseract>=0.3.10    # Optical Character Recognition
pillow>=10.0.0         # Image processing
google-generativeai>=0.3.0  # Gemini AI API
python-docx (optional) # DOCX support
```

#### 2. Resume Routes (`backend/app/routes/resumes.py`)

**Endpoint: `POST /api/resumes/upload`**

- **Authentication**: Required (JWT)
- **Input**: Multipart form data with file
- **Process**:
  1. Validates file upload
  2. Saves file to uploads folder
  3. Extracts text from the file
  4. Sends text to Gemini AI for skill extraction
  5. Updates user profile with extracted skills and resume data

**Response Format:**
```json
{
  "success": true,
  "message": "Resume processed successfully",
  "data": {
    "skillsExtracted": 15,
    "skills": {
      "python": {
        "name": "Python",
        "level": "intermediate",
        "category": "technical",
        "source": "resume"
      },
      ...
    },
    "resumeData": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "summary": "Experienced software engineer...",
      "experience": [...],
      "education": [...]
    }
  }
}
```

### Frontend Components

#### 1. ResumeUpload Component (`src/components/ui/ResumeUpload.tsx`)

A complete React component for resume upload with:

**Features:**
- Drag-and-drop file upload
- File validation with user feedback
- Loading state management
- Extracted skills display with categorization
- Resume information preview (name, email, experience, education)
- Error handling and recovery
- Dark mode support

**Props:**
```typescript
interface ResumeUploadProps {
  onSuccess?: (extractedSkills: ExtractedSkills) => void;
  onError?: (error: string) => void;
  userId?: string;
}
```

**Usage in ProfilePage:**
```tsx
<ResumeUpload
  onSuccess={(extractedSkills) => {
    // Handle successful extraction
    console.log('Skills extracted:', extractedSkills);
  }}
  onError={(error) => {
    // Handle errors
    console.error('Upload error:', error);
  }}
/>
```

#### 2. Resume Service (`src/services/resumeService.ts`)

Updated service with new types and functions:

```typescript
export interface Skill {
  name: string;
  level: string;
  endorsements?: number;
  category?: 'technical' | 'soft';
  source: string;
}

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  data: {
    skillsExtracted: number;
    skills: Record<string, Skill>;
    resumeData: ResumeParsedData;
  };
}

export async function uploadResume(
  file: File,
  userId?: string
): Promise<ResumeUploadResponse>
```

## Data Model

### User Profile Update

When a resume is processed, the user's profile is updated with:

```python
{
  "skills": {
    "python": {
      "name": "Python",
      "level": "intermediate",
      "endorsements": 0,
      "category": "technical",
      "source": "resume"
    },
    # ... more skills
  },
  "resumeData": {
    "name": "Full name",
    "email": "email@example.com",
    "phone": "phone number",
    "summary": "Brief professional summary",
    "experience": [
      {
        "company": "Company Name",
        "position": "Job Title",
        "duration": "Duration period",
        "description": "Job description"
      }
    ],
    "education": [
      {
        "institution": "University Name",
        "degree": "Degree Type",
        "field": "Field of Study",
        "year": "Graduation Year"
      }
    ],
    "certifications": ["Certification 1", "Certification 2"],
    "processedAt": "ISO timestamp",
    "filePath": "path/to/uploaded/file"
  },
  "updatedAt": "timestamp"
}
```

## AI Processing (Gemini)

The backend uses Google Gemini 2.5 Flash model with these settings:

```python
{
  "model": "gemini-2.5-flash",
  "temperature": 0.3,      # Low temperature for consistency
  "topP": 0.9,
  "topK": 40,
  "maxOutputTokens": 4096
}
```

**Prompt Structure:**
1. Analyzes resume text
2. Extracts technical skills, soft skills, experience, education
3. Returns structured JSON with all information
4. Handles missing fields gracefully

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

The following packages are added:
- `pypdf` - PDF text extraction
- `pdf2image` - PDF image conversion
- `pytesseract` - OCR support
- `pillow` - Image processing
- `google-generativeai` - Gemini AI

### 2. Configure Environment Variables

```env
# In .env file
GEMINI_API_KEY=your_api_key_here
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760  # 10MB
```

### 3. Create Uploads Directory

```bash
mkdir -p uploads
```

### 4. (Optional) Install OCR Support

For PDF-to-image conversion and OCR on Windows:

```bash
# Install Tesseract OCR
# Download from: https://github.com/UB-Mannheim/tesseract/wiki

# Or via Chocolatey:
choco install tesseract

# Set environment variable (in Python):
import pytesseract
pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Feature Usage Flow

1. **User navigates to Profile Page**
   - Existing users see the resume upload section at the bottom

2. **Upload Resume**
   - Drag and drop or click to select file
   - Supported formats: PDF, DOCX, TXT, PNG, JPG (max 10MB)

3. **AI Processing**
   - File is saved to `uploads/` folder
   - Text is extracted from file
   - Gemini AI analyzes the text
   - Structured data is returned

4. **Skills Display**
   - Extracted skills are displayed with categorization:
     - **Technical Skills**: Programming languages, frameworks, tools
     - **Soft Skills**: Communication, leadership, etc.
   - Resume data preview shows name, email, experience, education

5. **Profile Update**
   - Skills are saved to user profile
   - Resume data is stored for future reference
   - User can upload multiple resumes (latest overwrites)

## Error Handling

**Common Error Scenarios:**

1. **File Too Large**
   - Status: 413 Payload Too Large
   - Message: "File is too large. Maximum size is 10MB"

2. **Invalid File Type**
   - Status: 400 Bad Request
   - Message: "File type not allowed. Supported: PDF, TXT, DOCX, PNG, JPG, JPEG"

3. **Extraction Failed**
   - Status: 500 Internal Server Error
   - Message: Details about extraction failure
   - Check logs for more information

4. **AI API Error**
   - Status: 500 Internal Server Error
   - Message: "Error calling Gemini API: [details]"
   - Check GEMINI_API_KEY is valid

## Security Considerations

1. **File Upload Security**
   - Validates file extensions (whitelist)
   - Uses `secure_filename()` to sanitize names
   - Stores outside webroot (in `uploads/` folder)
   - Limits file size to 10MB

2. **Authentication**
   - All endpoints require JWT authentication
   - User can only upload their own resume

3. **API Key Security**
   - Gemini API key stored in environment variables
   - Never exposed to frontend
   - All AI calls happen server-side

## Performance Optimization

- **Text Extraction**: Fast for PDFs with embedded text (pypdf)
- **OCR Fallback**: For scanned documents (slower, but necessary)
- **AI Processing**: ~5-10 seconds for typical resumes
- **File Storage**: Files stored locally with user_id + timestamp prefix

## Future Enhancements

1. **Async Processing**
   - Implement job queue for large-scale processing
   - Return job ID for status checking
   - Webhook notifications on completion

2. **Resume Parsing Improvements**
   - Support for more formats (RTF, ODP)
   - Multi-language support
   - Format preservation

3. **Skill Management UI**
   - Allow users to manually add/remove extracted skills
   - Set custom skill levels
   - Mark false positives

4. **Resume Storage**
   - Cloud storage integration (AWS S3, Azure Blob)
   - Resume history and versioning
   - Automated resume updates

5. **Analytics**
   - Track skill extraction accuracy
   - Identify common skills across users
   - Skill trend analysis

## Troubleshooting

### PDF Text Extraction Fails

**Problem**: "Unable to extract text from PDF"

**Solutions**:
1. Ensure pypdf is installed: `pip install pypdf`
2. Try OCR fallback: Install pytesseract and pdf2image
3. Check if PDF is corrupted

### OCR Not Working

**Problem**: "pytesseract not installed" or "Tesseract not found"

**Solutions**:
1. Install pytesseract: `pip install pytesseract`
2. Install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki
3. Set pytesseract path in environment

### Gemini API Errors

**Problem**: "Error calling Gemini API"

**Solutions**:
1. Verify GEMINI_API_KEY is set correctly
2. Check API key has quota available
3. Ensure resume text is extracted properly (min 50 characters)

### Large File Upload Issues

**Problem**: "413 Payload Too Large"

**Solutions**:
1. Increase MAX_CONTENT_LENGTH in config.py
2. Compress images in PDF before uploading
3. Check server upload limits (nginx, etc.)

## Testing

To test the feature:

```bash
# 1. Start backend server
python backend/run.py

# 2. Create a test resume file
# Save a sample resume as test_resume.pdf

# 3. Test upload endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test_resume.pdf" \
  http://localhost:5000/api/resumes/upload

# 4. Check user profile for updated skills
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/users/YOUR_USER_ID
```

## References

- [Google Generative AI Python SDK](https://ai.google.dev/tutorials/python_quickstart)
- [PyPDF Documentation](https://pypdf.readthedocs.io/)
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)
- [Flask File Upload](https://flask.palletsprojects.com/en/2.3.x/patterns/fileuploads/)
