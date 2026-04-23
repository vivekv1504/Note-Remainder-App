"""
Flask API Server for AI Summary Generation
Uses LiteLLM with Azure OpenAI via Webex LLM Proxy
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from llm_service import generate_summary, test_connection

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, origins=allowed_origins)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI Summary API (LiteLLM + Webex)",
        "version": "1.0.0",
        "provider": "Azure OpenAI via Webex LLM Proxy",
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT")
    })


@app.route('/api/test-connection', methods=['GET'])
def test_llm_connection():
    """Test LiteLLM connection to Azure OpenAI"""
    result = test_connection()
    status_code = 200 if result['success'] else 500
    return jsonify(result), status_code


@app.route('/api/generate-summary', methods=['POST'])
def generate_ai_summary():
    """
    Generate AI summary from user data

    Expected JSON body:
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
    """
    try:
        # Get data from request
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided",
                "message": "Request body must contain summary data"
            }), 400

        # Validate required fields
        required_fields = ['notes', 'todos', 'reminders']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing_fields
            }), 400

        # Generate summary using LiteLLM
        summary = generate_summary(data)

        return jsonify({
            "success": True,
            "summary": summary,
            "model": f"azure/{os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4o')}",
            "provider": "LiteLLM (Azure OpenAI via Webex)"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to generate summary"
        }), 500


@app.route('/api/token-status', methods=['GET'])
def check_token_status():
    """Check if Webex bearer token is configured"""
    token = os.getenv('WEBEX_BEARER_TOKEN')
    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    api_version = os.getenv('AZURE_API_VERSION')

    return jsonify({
        "token_configured": bool(token and len(token) > 0),
        "endpoint_configured": bool(endpoint and len(endpoint) > 0),
        "api_version": api_version,
        "token_length": len(token) if token else 0,
        "endpoint": endpoint if endpoint else "Not configured",
        "deployment": os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', 'Not set')
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET /health",
            "GET /api/test-connection",
            "POST /api/generate-summary",
            "GET /api/token-status"
        ]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'

    print("=" * 70)
    print("🚀 AI Summary API Server (LiteLLM) Starting...")
    print("=" * 70)
    print(f"📝 Environment: {os.getenv('FLASK_ENV', 'production')}")
    print(f"🔌 Port: {port}")
    print(f"🔐 Token configured: {bool(os.getenv('WEBEX_BEARER_TOKEN'))}")
    print(f"🌐 Endpoint: {os.getenv('AZURE_OPENAI_ENDPOINT')}")
    print(f"📅 API Version: {os.getenv('AZURE_API_VERSION')}")
    print(f"🤖 Model: azure/{os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4o')}")
    print(f"🔧 Provider: LiteLLM (Unified Interface)")
    print("=" * 70)
    print(f"✅ Server ready at http://localhost:{port}")
    print(f"📖 Docs: http://localhost:{port}/health")
    print("=" * 70)

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
