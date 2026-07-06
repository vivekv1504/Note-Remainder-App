# AI Summary Backend (LiteLLM + Webex)

Flask API backend for AI-powered summary generation using LiteLLM with Azure OpenAI via Webex LLM Proxy.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Webex bearer token:

```bash
cp .env.example .env
```

Edit `.env`:
```env
WEBEX_BEARER_TOKEN=your_bearer_token_here
AZURE_OPENAI_ENDPOINT=https://llm-proxy.us-east-2.int.infra.intelligence.webex.com/azure/v1
AZURE_API_VERSION=2024-10-21
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
FLASK_ENV=development
FLASK_PORT=5001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5176
```

### 3. Get Webex Bearer Token

1. Go to: https://developer-portal-intb.ciscospark.com
2. Login with your Cisco credentials
3. Copy the bearer token from the Authorization field
4. Paste it in your `.env` file

### 4. Start the Server

```bash
python src/server.py
```

Server will start at: http://localhost:5001

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Test LiteLLM Connection
```bash
GET /api/test-connection
```

### Generate AI Summary
```bash
POST /api/generate-summary
Content-Type: application/json

{
  "notes": {
    "created": [...],
    "updated": [...],
    "deleted": [...]
  },
  "todos": {
    "completed": [...],
    "pending": 0
  },
  "reminders": {
    "triggered": [...],
    "due": [...],
    "overdue": [...]
  }
}
```

### Check Token Status
```bash
GET /api/token-status
```

## 🧪 Testing

Test the connection:
```bash
curl http://localhost:5001/api/test-connection | python3 -m json.tool
```

Test summary generation:
```bash
curl -X POST http://localhost:5001/api/generate-summary \
  -H "Content-Type: application/json" \
  -d '{
    "notes": {"created": [{"title": "Test"}], "updated": [], "deleted": []},
    "todos": {"completed": [], "pending": 0},
    "reminders": {"triggered": [], "due": [], "overdue": []}
  }' | python3 -m json.tool
```

## 🏗️ Architecture

```
Frontend (React)
    ↓
    ↓ HTTP Request
    ↓
Flask Backend (server.py)
    ↓
    ↓ Uses
    ↓
LiteLLM Service (llm_service.py)
    ↓
    ↓ Bearer Token Auth
    ↓
Webex LLM Proxy
    ↓
    ↓ Routes to
    ↓
Azure OpenAI (GPT-4o)
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WEBEX_BEARER_TOKEN` | Bearer token from Webex developer portal | Yes |
| `AZURE_OPENAI_ENDPOINT` | Webex LLM Proxy endpoint URL | Yes |
| `AZURE_API_VERSION` | Azure OpenAI API version | Yes |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name (e.g., gpt-4o) | Yes |
| `FLASK_ENV` | Flask environment (development/production) | No |
| `FLASK_PORT` | Port to run Flask server | No |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | No |

## 🐛 Troubleshooting

### 403 Unauthorized Error
- Verify your bearer token is valid and not expired
- Get a fresh token from https://developer-portal-intb.ciscospark.com
- Ensure your organization has access to the LLM Proxy service

### 404 Model Not Found
- Check the `AZURE_OPENAI_DEPLOYMENT_NAME` is correct
- Currently supported: `gpt-4o`, `gpt-4`
- Verify the model is available in your organization

### Connection Timeout
- Check your network connection
- Verify the endpoint URL is correct
- Ensure the Webex LLM Proxy is accessible from your network

## 📦 Dependencies

- `flask==3.0.0` - Web framework
- `flask-cors==4.0.0` - CORS support
- `litellm>=1.83.0` - Unified LLM interface
- `python-dotenv==1.0.0` - Environment variable management
- `requests==2.31.0` - HTTP client

## 🔐 Security Notes

- Never commit `.env` file to version control
- Bearer tokens expire and need to be refreshed periodically
- Use environment-specific configurations for production
- Enable proper CORS settings in production

## 📝 License

Internal Cisco project - not for public distribution
