# 🚀 OpenRouter Setup - Quick Reference

## ⚡ Ultra Quick Setup (3 Steps)

```bash
# 1. Get API key from: https://openrouter.ai/keys
# 2. Set environment variable
export OPENROUTER_API_KEY=your_key_here

# 3. Run setup script
# Windows PowerShell:
.\setup_openrouter.ps1

# Linux/Mac:
chmod +x setup_openrouter.sh
./setup_openrouter.sh
```

## 🔑 Get Your FREE API Key

1. Visit: **https://openrouter.ai/**
2. Click "Sign Up" (free, no credit card)
3. Go to: **https://openrouter.ai/keys**
4. Click "Create Key"
5. Copy your API key

## 📝 Manual Setup (if scripts don't work)

### Windows (CMD)
```cmd
set OPENROUTER_API_KEY=your_key_here
mkdir uploads
pip install -r requirements.txt
cd backend
python run.py
```

### Windows (PowerShell)
```powershell
$env:OPENROUTER_API_KEY="your_key_here"
mkdir uploads
pip install -r requirements.txt
cd backend
python run.py
```

### Linux/Mac
```bash
export OPENROUTER_API_KEY=your_key_here
mkdir -p uploads
pip3 install -r requirements.txt
cd backend
python3 run.py
```

## 🔍 Verify Setup

```bash
# Check if API key is set
echo $OPENROUTER_API_KEY    # Linux/Mac
echo %OPENROUTER_API_KEY%   # Windows CMD
echo $env:OPENROUTER_API_KEY  # Windows PowerShell
```

## 🧪 Test Resume Upload

1. Start backend: `python run.py` (in backend folder)
2. Navigate to: http://localhost:5173 (or your frontend URL)
3. Go to Profile page
4. Find "Resume Upload & AI Skill Extraction"
5. Upload a resume (PDF, DOCX, TXT, PNG, JPG)
6. Wait 10-30 seconds
7. View extracted skills!

## ❌ Troubleshooting

### Error: "OPENROUTER_API_KEY not found"
```bash
# Make sure you set it and restart terminal
# Windows:
set OPENROUTER_API_KEY=your_key

# Linux/Mac:
export OPENROUTER_API_KEY=your_key
source ~/.bashrc  # or ~/.zshrc
```

### Error: "401 Unauthorized"
- Invalid API key
- Get new key from: https://openrouter.ai/keys

### Error: "Module not found"
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## 📊 What's Different from Gemini?

| Feature | Google Gemini | OpenRouter |
|---------|---------------|------------|
| **Cost** | Paid | FREE |
| **API Key** | `GEMINI_API_KEY` | `OPENROUTER_API_KEY` |
| **Setup** | Credit card required | No credit card |
| **Model** | gemini-2.5-flash | hermes-3-llama-3.1-405b |
| **Speed** | 5-10s | 5-15s |
| **Quality** | Excellent | Excellent |

## 🎯 Key Environment Variables

**Required:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key

**Optional:**
- `UPLOAD_FOLDER` - Default: "uploads"
- `MAX_CONTENT_LENGTH` - Default: 10485760 (10MB)
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET_KEY` - For authentication

## 📚 Documentation

- **Full Setup Guide:** [OPENROUTER_SETUP.md](OPENROUTER_SETUP.md)
- **Original Docs:** [RESUME_QUICK_START.md](RESUME_QUICK_START.md)
- **Feature Guide:** [README_RESUME_FEATURE.md](README_RESUME_FEATURE.md)

## 🔗 Useful Links

- OpenRouter: https://openrouter.ai/
- API Keys: https://openrouter.ai/keys
- Documentation: https://openrouter.ai/docs
- Models: https://openrouter.ai/models

## ✅ Quick Checklist

- [ ] OpenRouter account created (free)
- [ ] API key obtained from dashboard
- [ ] `OPENROUTER_API_KEY` environment variable set
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Uploads folder created: `mkdir uploads`
- [ ] Backend started: `python run.py`
- [ ] Frontend running
- [ ] Test resume uploaded successfully

## 💡 Pro Tips

1. **Persistent API Key:** Add to `.env` file for persistence
2. **Test First:** Try with a simple TXT resume first
3. **Check Logs:** Look at terminal output for errors
4. **API Limits:** Free tier is generous, but monitor usage
5. **Backup Key:** Save your API key securely

## 🎉 That's It!

You're now using OpenRouter's FREE AI model for resume parsing.
No credit card required, generous limits, and excellent quality!

Upload a resume and see the magic happen! ✨
