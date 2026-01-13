# OpenRouter API Setup for Resume Upload Feature

## Quick Setup

### 1. Get OpenRouter API Key (FREE)

1. Visit: https://openrouter.ai/
2. Sign up for a free account
3. Go to: https://openrouter.ai/keys
4. Create a new API key
5. Copy the API key

### 2. Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:OPENROUTER_API_KEY="your_api_key_here"
```

**Windows (CMD):**
```cmd
set OPENROUTER_API_KEY=your_api_key_here
```

**Linux/Mac:**
```bash
export OPENROUTER_API_KEY=your_api_key_here
```

**Or add to .env file:**
```env
OPENROUTER_API_KEY=your_api_key_here
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

### 4. Create Uploads Directory

```bash
mkdir uploads
```

### 5. Start Application

```bash
cd backend
python run.py
```

## What Changed

### Previous: Google Gemini
- Required: `GEMINI_API_KEY`
- Library: `google-generativeai`
- Model: `gemini-2.5-flash`

### Now: OpenRouter
- Required: `OPENROUTER_API_KEY`
- Library: `requests` (standard HTTP)
- Model: `nousresearch/hermes-3-llama-3.1-405b:free` (FREE!)

## Model Details

**Model Name:** Hermes 3 Llama 3.1 405B (Free)
- **Provider:** Nous Research
- **Cost:** FREE (no credit card required)
- **Context:** 128k tokens
- **Performance:** Excellent for resume parsing
- **API Endpoint:** https://openrouter.ai/api/v1/chat/completions

## Testing the Resume Upload

### 1. Test with cURL

```bash
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sample_resume.pdf"
```

### 2. Test from Frontend

1. Navigate to Profile page
2. Find "Resume Upload & AI Skill Extraction"
3. Upload a resume file
4. Wait for processing (10-30 seconds)
5. View extracted skills

## Troubleshooting

### Error: "OPENROUTER_API_KEY not found"

**Solution:**
```bash
# Make sure environment variable is set
echo $OPENROUTER_API_KEY  # Linux/Mac
echo %OPENROUTER_API_KEY%  # Windows CMD
echo $env:OPENROUTER_API_KEY  # Windows PowerShell

# If empty, set it again
export OPENROUTER_API_KEY=your_key  # Linux/Mac
set OPENROUTER_API_KEY=your_key     # Windows CMD
$env:OPENROUTER_API_KEY="your_key"  # Windows PowerShell
```

### Error: "OpenRouter API error: 401"

**Solution:**
- API key is invalid or expired
- Get a new API key from https://openrouter.ai/keys
- Make sure you copied the entire key

### Error: "OpenRouter API error: 429"

**Solution:**
- Rate limit reached (unlikely with free tier)
- Wait a few minutes and try again
- Free tier is generous for resume parsing

### Error: "Request timeout"

**Solution:**
- Resume might be too large or complex
- Try a smaller/simpler resume first
- Check internet connection

## API Response Example

```json
{
  "success": true,
  "message": "Resume processed successfully",
  "data": {
    "skillsExtracted": 18,
    "skills": {
      "python": {
        "name": "Python",
        "level": "intermediate",
        "category": "technical",
        "source": "resume"
      }
    },
    "resumeData": {
      "name": "John Doe",
      "email": "john@example.com",
      "summary": "Experienced software engineer...",
      "experience": [...],
      "education": [...]
    }
  }
}
```

## Benefits of OpenRouter

✅ **Free:** No credit card required
✅ **No Quota:** Generous free tier
✅ **Fast:** Low latency
✅ **Reliable:** High uptime
✅ **No Setup:** Just get API key and use
✅ **Multiple Models:** Can switch models easily

## Alternative Models (if needed)

You can change the model in `backend/app/services/resume_service.py`:

```python
# Current (Free)
"model": "nousresearch/hermes-3-llama-3.1-405b:free"

# Alternative Free Models:
"model": "meta-llama/llama-3.1-8b-instruct:free"
"model": "google/gemma-2-9b-it:free"
"model": "mistralai/mistral-7b-instruct:free"
```

## Environment Variables Summary

**Required:**
```env
OPENROUTER_API_KEY=your_openrouter_api_key
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760
```

**Optional:**
```env
JWT_SECRET_KEY=your_jwt_secret
SECRET_KEY=your_secret_key
MONGO_URI=your_mongodb_uri
```

## Quick Test Script

Create `test_resume_upload.py`:

```python
import requests
import os

# Get JWT token from login
login_response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'student@example.com',
    'password': 'password'
})
token = login_response.json()['token']

# Upload resume
with open('sample_resume.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/resumes/upload',
        headers={'Authorization': f'Bearer {token}'},
        files={'file': f}
    )
    
print(response.json())
```

Run:
```bash
python test_resume_upload.py
```

## Performance

- **Text Extraction:** 2-10 seconds (depending on file type)
- **AI Processing:** 5-15 seconds (OpenRouter API)
- **Total:** 7-25 seconds average

## Next Steps

1. ✅ Get OpenRouter API key
2. ✅ Set OPENROUTER_API_KEY environment variable
3. ✅ Install requirements: `pip install -r requirements.txt`
4. ✅ Create uploads folder: `mkdir uploads`
5. ✅ Start backend: `python backend/run.py`
6. ✅ Test with sample resume
7. ✅ Verify skills extracted correctly

---

**Status:** Ready to use with OpenRouter!
**Cost:** FREE
**No Credit Card:** Required
**Setup Time:** 5 minutes
