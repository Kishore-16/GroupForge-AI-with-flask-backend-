# Resume Upload Feature - Technical Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER (Frontend)                         │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ ProfilePage (src/pages/ProfilePage.tsx)                          │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │ ResumeUpload Component                                     │  │   │
│  │  │ (src/components/ui/ResumeUpload.tsx)                       │  │   │
│  │  │                                                             │  │   │
│  │  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │   │
│  │  │  │ Drag/Drop   │  │  File Input  │  │ File Validation │  │  │   │
│  │  │  │   Upload    │  │   Component  │  │   & Preview     │  │  │   │
│  │  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │   │
│  │  │         │                │                    │           │  │   │
│  │  │         └────────────────┼────────────────────┘           │  │   │
│  │  │                          │                                 │  │   │
│  │  │                    ┌─────▼──────┐                          │  │   │
│  │  │                    │  POST /api  │                          │  │   │
│  │  │                    │  resumes/   │                          │  │   │
│  │  │                    │  upload     │                          │  │   │
│  │  │                    └─────┬──────┘                          │  │   │
│  │  │                          │                                 │  │   │
│  │  │         ┌────────────────┴────────────────┐               │  │   │
│  │  │         │   Extract & Display Results     │               │  │   │
│  │  │         │   - Skills with badges         │               │  │   │
│  │  │         │   - Resume data preview        │               │  │   │
│  │  │         │   - Experience & Education    │               │  │   │
│  │  │         └────────────────┬────────────────┘               │  │   │
│  │  │                          │                                 │  │   │
│  │  │                    Update User Profile                     │  │   │
│  │  │                    (via authApi)                           │  │   │
│  │  └──────────────────────────┼─────────────────────────────────┘  │   │
│  │                             │                                     │   │
│  └─────────────────────────────┼─────────────────────────────────────┘   │
│                                │                                         │
│                    JWT Token (localStorage)                             │
│                                │                                         │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
                                 │ HTTP/FormData
                                 │ (Resume File + JWT)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (Python)                               │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Routes Layer (backend/app/routes/resumes.py)                     │   │
│  │                                                                   │   │
│  │  POST /api/resumes/upload                                        │   │
│  │  ├─ @jwt_required()                                              │   │
│  │  ├─ Validate file (extension, size)                              │   │
│  │  └─ Call resume_service.process_resume_file()                    │   │
│  │     │                                                             │   │
│  └─────┼──────────────────────────────────────────────────────────────┘   │
│        │                                                                  │
│        ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Services Layer (backend/app/services/resume_service.py)         │   │
│  │                                                                   │   │
│  │  ┌─────────────────────┐ Step 1: Save Upload ─────────────┐    │   │
│  │  │ save_resume()       │                                  │    │   │
│  │  │ - Validate filename │                                  │    │   │
│  │  │ - Add timestamp ID  │                                  │    │   │
│  │  │ - Save to uploads/  │                                  ▼    │   │
│  │  └─────────────────────┘                    ┌──────────────────┐│   │
│  │                                              │  uploads/        ││   │
│  │                                              │  {user_id}_{ts}_ ││   │
│  │                                              │  resume.pdf      ││   │
│  │                                              └──────────────────┘│   │
│  │                                                                   │   │
│  │  ┌──────────────────────── Step 2: Extract Text ────────────┐   │   │
│  │  │ extract_text_from_file()                                │   │   │
│  │  │ Routes based on file type:                              │   │   │
│  │  │                                                         │   │   │
│  │  │  ┌──────────────┐                                       │   │   │
│  │  │  │ PDF File     │──→ extract_text_from_pdf()            │   │   │
│  │  │  │              │    ├─ Try pypdf (fast)                │   │   │
│  │  │  │              │    └─ Fallback: pdf2image + Tesseract │   │   │
│  │  │  └──────────────┘                                       │   │   │
│  │  │                                                         │   │   │
│  │  │  ┌──────────────┐                                       │   │   │
│  │  │  │ Image (PNG/  │──→ extract_text_from_image()          │   │   │
│  │  │  │ JPG)         │    └─ Tesseract OCR                   │   │   │
│  │  │  └──────────────┘                                       │   │   │
│  │  │                                                         │   │   │
│  │  │  ┌──────────────┐                                       │   │   │
│  │  │  │ DOCX/DOC     │──→ python-docx                        │   │   │
│  │  │  │              │                                       │   │   │
│  │  │  └──────────────┘                                       │   │   │
│  │  │                                                         │   │   │
│  │  │  ┌──────────────┐                                       │   │   │
│  │  │  │ TXT          │──→ Read as UTF-8                      │   │   │
│  │  │  │              │                                       │   │   │
│  │  │  └──────────────┘                                       │   │   │
│  │  │                                                         │   │   │
│  │  └─────────────────────┬──────────────────────────────────┘   │   │
│  │                        │                                       │   │
│  │                        ▼                                       │   │
│  │                   Resume Text String                          │   │
│  │                   (min 50 characters)                          │   │
│  │                                                                   │   │
│  │  ┌──────────────────── Step 3: AI Processing ──────────────┐   │   │
│  │  │ extract_skills_from_resume()                            │   │   │
│  │  │                                                         │   │   │
│  │  │  Create Prompt:                                        │   │   │
│  │  │  ├─ System: "You are an expert resume parser..."      │   │   │
│  │  │  ├─ Include: Resume text                              │   │   │
│  │  │  └─ Request: JSON with skills, experience, etc.       │   │   │
│  │  │                                                         │   │   │
│  │  │  Call Gemini AI:                                       │   │   │
│  │  │  ├─ Model: gemini-2.5-flash                           │   │   │
│  │  │  ├─ Temperature: 0.3 (consistent results)             │   │   │
│  │  │  └─ MaxTokens: 4096                                   │   │   │
│  │  │                                                         │   │   │
│  │  └──────────────────┬─────────────────────────────────────┘   │   │
│  │                     │                                          │   │
│  └─────────────────────┼──────────────────────────────────────────┘   │
│                        │                                               │
│                        │ HTTP Request                                 │
│                        ▼                                               │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          │ API Key (env var)
                          │
┌─────────────────────────▼─────────────────────────────────────────────┐
│                   GOOGLE GEMINI AI                                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Model: gemini-2.5-flash                                         │ │
│  │                                                                   │ │
│  │ Input: Resume text + Detailed prompt for extraction             │ │
│  │                                                                   │ │
│  │ Processing:                                                      │ │
│  │ ├─ Analyze resume text                                           │ │
│  │ ├─ Extract skills (technical + soft)                             │ │
│  │ ├─ Identify experience & education                               │ │
│  │ ├─ Generate professional summary                                 │ │
│  │ └─ Format as JSON                                                │ │
│  │                                                                   │ │
│  │ Output: JSON                                                      │ │
│  │ {                                                                 │ │
│  │   "skills": ["Python", "React", ...],                            │ │
│  │   "technical_skills": ["Python", "React", ...],                  │ │
│  │   "soft_skills": ["Communication", ...],                         │ │
│  │   "experience": [{company, position, ...}],                      │ │
│  │   "education": [{institution, degree, ...}],                     │ │
│  │   "name": "...",                                                  │ │
│  │   "email": "...",                                                 │ │
│  │   "summary": "..."                                                │ │
│  │ }                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────┬───────────────────────────────────────────────────┘
                     │
                     │ JSON Response
                     │
┌────────────────────▼───────────────────────────────────────────────────┐
│                    FLASK BACKEND (CONTINUED)                           │
│                                                                        │
│  ┌──────────────────── Step 4: Process AI Response ───────────────┐   │
│  │                                                                │   │
│  │ Parse JSON from Gemini:                                       │   │
│  │ ├─ Extract all skills                                         │   │
│  │ ├─ Categorize (technical/soft/other)                          │   │
│  │ ├─ Combine with metadata                                      │   │
│  │ └─ Build user skill dict                                      │   │
│  │                                                                │   │
│  │ Skill Structure:                                              │   │
│  │ {                                                              │   │
│  │   "python": {                                                 │   │
│  │     "name": "Python",                                         │   │
│  │     "level": "intermediate",                                  │   │
│  │     "category": "technical",                                  │   │
│  │     "source": "resume",                                       │   │
│  │     "endorsements": 0                                         │   │
│  │   },                                                           │   │
│  │   ...                                                          │   │
│  │ }                                                              │   │
│  └──────────────┬───────────────────────────────────────────────┘   │
│                 │                                                     │
│  ┌──────────────▼───────────────────────────────────────────────┐   │
│  │ Step 5: Update MongoDB User Profile                         │   │
│  │                                                              │   │
│  │ Update user_id document:                                    │   │
│  │ ├─ skills: {...} (extracted skills dict)                   │   │
│  │ ├─ resumeData: {                                            │   │
│  │ │   name, email, phone, summary,                           │   │
│  │ │   experience, education, certifications,                 │   │
│  │ │   processedAt, filePath                                  │   │
│  │ │ }                                                          │   │
│  │ └─ updatedAt: timestamp                                     │   │
│  │                                                              │   │
│  └──────────────┬───────────────────────────────────────────────┘   │
│                 │                                                     │
│                 ▼                                                     │
│          ┌─────────────────┐                                          │
│          │   MongoDB       │                                          │
│          │   users         │                                          │
│          │   collection    │                                          │
│          └─────────────────┘                                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Step 6: Return Response to Client                           │   │
│  │                                                              │   │
│  │ Response (JSON):                                            │   │
│  │ {                                                            │   │
│  │   "success": true,                                          │   │
│  │   "message": "Resume processed successfully",               │   │
│  │   "data": {                                                 │   │
│  │     "skillsExtracted": 18,                                  │   │
│  │     "skills": {...},                                        │   │
│  │     "resumeData": {...}                                     │   │
│  │   }                                                          │   │
│  │ }                                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────┬───────────────────────────────────────────────────┘
                     │
                     │ HTTP Response
                     │
┌────────────────────▼───────────────────────────────────────────────────┐
│                    BROWSER (Frontend) - FINAL STEP                     │
│                                                                        │
│  ResumeUpload Component receives response:                            │
│  ├─ Display success message                                           │
│  ├─ Show extracted skills with badges                                 │
│  │  ├─ Technical skills (blue)                                        │
│  │  ├─ Soft skills (purple)                                           │
│  │  └─ Other skills (gray)                                            │
│  ├─ Show resume preview:                                              │
│  │  ├─ Name, email, phone                                             │
│  │  ├─ Professional summary                                           │
│  │  ├─ Experience history                                             │
│  │  └─ Education history                                              │
│  └─ Offer to upload another resume or confirm                         │
│                                                                        │
│  User profile automatically updated:                                  │
│  ├─ Skills available in profile view                                  │
│  ├─ Skills used for team matching                                     │
│  ├─ Skills included in assessments                                    │
│  └─ Resume data stored for future reference                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence Diagram

```
Client              Frontend          Backend           MongoDB         Gemini
  │                   │                 │                 │              │
  │ Click "Upload"    │                 │                 │              │
  ├──────────────────▶│                 │                 │              │
  │                   │ Select File     │                 │              │
  │                   │◀────────────────┤                 │              │
  │                   │ Validate        │                 │              │
  │                   │ (type, size)    │                 │              │
  │                   │                 │                 │              │
  │                   │ POST /upload    │                 │              │
  │                   │ (JWT + file)    │                 │              │
  │                   ├────────────────▶│                 │              │
  │                   │                 │ Check Auth      │              │
  │                   │                 │ Validate File   │              │
  │                   │                 │ Save to Disk    │              │
  │                   │                 │ Extract Text    │              │
  │                   │                 ├─────────────────▶              │
  │                   │                 │                 │ Parse Text   │
  │                   │                 │                 │ Extract Data │
  │                   │                 │◀─────────────────┤ Return JSON │
  │                   │                 │ Process JSON    │              │
  │                   │                 │ Build Skills    │              │
  │                   │                 │ Update Profile  │              │
  │                   │                 ├────────────────────────────────▶
  │                   │                 │                 │ Save/Update │
  │                   │                 │◀────────────────────────────────
  │                   │ Return Data     │                 │              │
  │                   │◀────────────────┤                 │              │
  │ Display Results   │                 │                 │              │
  │◀──────────────────┤                 │                 │              │
  │ Show Skills       │                 │                 │              │
  │ Show Resume Info  │                 │                 │              │
  │ Update Profile   │                 │                 │              │
  │                   │                 │                 │              │
```

## Error Handling Flow

```
┌─ File Upload ──┐
│                │
├─ Size Check ───┤─ Too Large? ──▶ Return 413 "File too large"
│                │
├─ Type Check ───┤─ Invalid? ──▶ Return 400 "File type not allowed"
│                │
├─ Save File ────┤─ Fails? ──▶ Return 500 "Failed to save file"
│                │
├─ Extract Text ─┤─ Fails? ──▶ Return 500 "Failed to extract text"
│                │
├─ Call AI ──────┤─ API Error? ──▶ Return 500 "Gemini API error"
│                │
├─ Parse JSON ───┤─ Invalid? ──▶ Return 500 "Failed to parse response"
│                │
├─ Update DB ────┤─ Fails? ──▶ Return 500 "Failed to update profile"
│                │
└─ Success! ─────┘─▶ Return 200 with extracted data
```

## Supported File Types & Processing

```
File Type    Processor            Speed    OCR Needed
────────────────────────────────────────────────────
PDF (text)   pypdf               ▓▓░░░░░  No
PDF (scanned) pdf2image+ocr      ▓░░░░░░  Yes
DOCX         python-docx         ▓▓░░░░░  No
DOC          python-docx         ▓▓░░░░░  No
TXT          builtin read        ▓▓▓▓░░░  No
PNG          PIL+Tesseract       ▓░░░░░░  Yes
JPG          PIL+Tesseract       ▓░░░░░░  Yes
```

## Skill Extraction Categories

```
ALL SKILLS
    ├─ Technical Skills
    │  ├─ Programming Languages
    │  │  ├─ Python, Java, C++, Go, Rust, etc.
    │  ├─ Frameworks & Libraries
    │  │  ├─ React, Angular, Vue, Django, Flask, etc.
    │  ├─ Databases
    │  │  ├─ SQL, MongoDB, PostgreSQL, Firebase, etc.
    │  ├─ Tools & Platforms
    │  │  ├─ AWS, Docker, Git, Linux, etc.
    │  └─ Specializations
    │     ├─ Machine Learning, DevOps, Full Stack, etc.
    │
    └─ Soft Skills
       ├─ Communication
       ├─ Leadership
       ├─ Teamwork
       ├─ Problem Solving
       ├─ Project Management
       ├─ Critical Thinking
       └─ etc.
```

---

**Diagram Version**: 1.0
**Last Updated**: January 2026
