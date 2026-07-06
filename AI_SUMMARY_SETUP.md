# AI Summary Feature - Setup Guide

Complete guide for the AI-powered summary feature using LiteLLM + Webex Bearer Token + Azure OpenAI.

## 🎯 Overview

The AI Summary feature analyzes your notes, todos, and reminders over the last 7 days and provides intelligent insights using Azure OpenAI's GPT-4o model via Cisco's Webex LLM Proxy.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 5173)
│  (Vite + React) │
└────────┬────────┘
         │ HTTP POST /api/generate-summary
         ↓
┌─────────────────┐
│  Flask Backend  │ (Port 5001)
│   (LiteLLM)     │
└────────┬────────┘
         │ Bearer Token Authentication
         ↓
┌─────────────────┐
│ Webex LLM Proxy │ (us-east-2)
│  (Cisco Internal)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Azure OpenAI    │
│    (GPT-4o)     │
└─────────────────┘
```

## 📋 Prerequisites

1. **Python 3.10+** installed
2. **Node.js 18+** installed
3. **Webex Bearer Token** from Cisco internal portal
4. **Access to Webex LLM Proxy** (organization-level permission)

## 🚀 Setup Instructions

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Get Webex Bearer Token:**
   - Go to: https://developer-portal-intb.ciscospark.com
   - Login with your Cisco credentials
   - Copy the bearer token displayed on the page

5. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your token:
   ```env
   WEBEX_BEARER_TOKEN=your_actual_bearer_token_here
   ```

6. **Start backend server:**
   ```bash
   python src/server.py
   ```
   
   You should see:
   ```
   ======================================================================
   🚀 AI Summary API Server (LiteLLM) Starting...
   ======================================================================
   ✅ Server ready at http://localhost:5001
   ======================================================================
   ```

7. **Test backend connection:**
   ```bash
   curl http://localhost:5001/api/test-connection
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "message": "LiteLLM connection successful via Webex LLM Proxy",
     "model": "azure/gpt-4o"
   }
   ```

### Step 2: Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd /Users/vinvivek/Desktop/Remainder-note-app
   ```

2. **Configure environment:**
   - `.env` file should already have:
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: http://localhost:5173

### Step 3: Test Integration

1. **Open the app:** http://localhost:5173
2. **Login/Register** with your account
3. **Create some notes and todos** (or use existing data)
4. **Navigate to Summary/Dashboard view**
5. **Click "Generate AI Summary"**
6. **Verify AI-generated summary appears**

## 🧪 Manual Testing

### Test Backend Directly

```bash
# Test connection
curl http://localhost:5001/api/test-connection | python3 -m json.tool

# Test summary generation
curl -X POST http://localhost:5001/api/generate-summary \
  -H "Content-Type: application/json" \
  -d '{
    "notes": {
      "created": [{"title": "Meeting Notes"}],
      "updated": [],
      "deleted": []
    },
    "todos": {
      "completed": [{"title": "Review PR"}],
      "pending": 2
    },
    "reminders": {
      "triggered": [],
      "due": [{"title": "Submit report"}],
      "overdue": []
    }
  }' | python3 -m json.tool
```

## 🔧 Configuration

### Backend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `WEBEX_BEARER_TOKEN` | From Webex portal | Authentication token |
| `AZURE_OPENAI_ENDPOINT` | `https://llm-proxy.us-east-2.int.infra.intelligence.webex.com/azure/v1` | Webex proxy endpoint |
| `AZURE_API_VERSION` | `2024-10-21` | API version |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | `gpt-4o` | Model name |
| `FLASK_PORT` | `5001` | Backend port |
| `FLASK_ENV` | `development` | Environment |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | CORS origins |

### Frontend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:5001` | Backend API URL |

## 📁 File Structure

```
Remainder-note-app/
├── backend/
│   ├── src/
│   │   ├── server.py          # Flask API server
│   │   └── llm_service.py     # LiteLLM integration
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Backend configuration (SECRET)
│   ├── .env.example           # Configuration template
│   └── README.md              # Backend documentation
├── src/
│   └── services/
│       ├── llmService.js      # Frontend LLM service
│       └── summaryService.js  # Summary data aggregation
├── .env                       # Frontend configuration (SECRET)
├── .env.example              # Configuration template
└── AI_SUMMARY_SETUP.md       # This file
```

## 🐛 Troubleshooting

### Backend Issues

**Problem: 403 Unauthorized**
- **Cause:** Invalid or expired bearer token
- **Solution:** Get a fresh token from https://developer-portal-intb.ciscospark.com

**Problem: 404 Model Not Found**
- **Cause:** Wrong model name in configuration
- **Solution:** Verify `AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o` in `.env`

**Problem: Connection timeout**
- **Cause:** Network or endpoint issues
- **Solution:** Check network connection and verify endpoint URL

**Problem: Server won't start**
- **Cause:** Port 5001 already in use
- **Solution:** `lsof -ti:5001 | xargs kill -9` or change `FLASK_PORT`

### Frontend Issues

**Problem: "Backend API request failed"**
- **Cause:** Backend not running or wrong URL
- **Solution:** 
  1. Verify backend is running: `curl http://localhost:5001/health`
  2. Check `VITE_BACKEND_URL` in `.env`

**Problem: CORS errors**
- **Cause:** Frontend origin not in `ALLOWED_ORIGINS`
- **Solution:** Add your frontend URL to backend `.env`

**Problem: Summary shows "Local Fallback"**
- **Cause:** Backend error or not reachable
- **Solution:** Check browser console and backend logs

## 🔐 Security

- ⚠️ **Never commit `.env` files** to version control
- ⚠️ **Bearer tokens expire** - refresh periodically
- ⚠️ **Token is organization-scoped** - only works for authorized users
- ⚠️ Keep backend `.env` and frontend `.env` separate

## 📊 API Request Format

### Frontend → Backend

```javascript
POST /api/generate-summary
{
  "notes": {
    "created": [{title, content, createdAt}],
    "updated": [{title, updatedAt}],
    "deleted": [{title, deletedAt}]
  },
  "todos": {
    "completed": [{title, completedAt}],
    "pending": <number>
  },
  "reminders": {
    "triggered": [{noteTitle, triggeredAt}],
    "due": [{noteTitle, reminderTime}],
    "overdue": [{noteTitle, daysOverdue}]
  }
}
```

### Backend → Frontend Response

```javascript
{
  "success": true,
  "summary": "AI-generated summary text...",
  "model": "azure/gpt-4o",
  "provider": "LiteLLM (Azure OpenAI via Webex)"
}
```

## 🎓 Learning Resources

- **LiteLLM Docs:** https://docs.litellm.ai/
- **Azure OpenAI:** https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **Flask:** https://flask.palletsprojects.com/
- **Webex Developer Portal:** https://developer-portal-intb.ciscospark.com

## ✅ Success Checklist

- [ ] Python virtual environment created and activated
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Webex bearer token obtained and added to backend `.env`
- [ ] Backend server running on port 5001
- [ ] Backend connection test successful (`/api/test-connection`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend `.env` configured with `VITE_BACKEND_URL`
- [ ] Frontend dev server running on port 5173
- [ ] AI Summary generates successfully in the app
- [ ] Summary shows "Azure OpenAI (LiteLLM)" as source

## 🎉 You're Done!

The AI Summary feature is now fully operational. Users can:
- View weekly activity summaries
- Get AI-powered insights
- Receive personalized productivity recommendations
- Track completion rates and streaks

All powered by Azure OpenAI GPT-4o through Cisco's secure Webex LLM Proxy!
