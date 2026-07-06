"""
LLM Service using LiteLLM with Azure OpenAI via Webex
Enterprise-grade AI integration with unified interface
"""
import os
from typing import Dict, Any
import litellm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure LiteLLM with Azure OpenAI via Webex
os.environ["AZURE_OPENAI_API_KEY"] = os.getenv("WEBEX_BEARER_TOKEN", "")
os.environ["AZURE_API_BASE"] = os.getenv("AZURE_OPENAI_ENDPOINT", "")
os.environ["AZURE_API_VERSION"] = os.getenv("AZURE_API_VERSION", "2024-10-21")

# Deployment configuration
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")
MODEL = f"azure/{DEPLOYMENT_NAME}"

# Enable LiteLLM debug logging (optional)
# litellm.set_verbose = True


def generate_summary(summary_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate AI summary using LiteLLM with Azure OpenAI backend

    Args:
        summary_data: Dictionary containing user's note activity data

    Returns:
        Dictionary with summary text and source indicator
    """
    try:
        # Create prompt from data
        prompt = create_prompt(summary_data)

        # Call LiteLLM (routes to Azure OpenAI via Webex)
        response = litellm.completion(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful productivity assistant analyzing user's note-taking activity. Provide friendly, actionable insights in a conversational tone."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=600,
            timeout=20  # 20 second timeout
        )

        # Extract text from LiteLLM response
        summary_text = response.choices[0].message.content
        return {
            "text": summary_text,
            "is_ai": True
        }

    except litellm.exceptions.Timeout:
        print("❌ LiteLLM request timeout")
        return {
            "text": generate_fallback_summary(summary_data),
            "is_ai": False
        }

    except litellm.exceptions.AuthenticationError as e:
        print(f"❌ Authentication failed: {str(e)}")
        print("   Check your Webex bearer token in .env file")
        return {
            "text": generate_fallback_summary(summary_data),
            "is_ai": False
        }

    except litellm.exceptions.RateLimitError as e:
        print(f"❌ Rate limit exceeded: {str(e)}")
        return {
            "text": generate_fallback_summary(summary_data),
            "is_ai": False
        }

    except Exception as e:
        error_type = type(e).__name__
        print(f"❌ LiteLLM error ({error_type}): {str(e)}")
        return {
            "text": generate_fallback_summary(summary_data),
            "is_ai": False
        }


def create_prompt(data: Dict[str, Any]) -> str:
    """
    Create a detailed prompt from summary data
    """
    notes = data.get('notes', {})
    todos = data.get('todos', {})
    reminders = data.get('reminders', {})

    # Extract counts
    notes_created = len(notes.get('created', []))
    notes_updated = len(notes.get('updated', []))
    notes_deleted = len(notes.get('deleted', []))
    todos_completed = len(todos.get('completed', []))
    todos_pending = todos.get('pending', 0)
    reminders_triggered = len(reminders.get('triggered', []))
    reminders_due = len(reminders.get('due', []))
    reminders_overdue = len(reminders.get('overdue', []))

    # Get recent note titles
    recent_titles = [n.get('title', 'Untitled') for n in notes.get('created', [])[:5]]

    prompt = f"""Analyze this user's note-taking activity from the last 7 days and provide a friendly, insightful summary.

📊 Activity Summary:
- Notes created: {notes_created}
- Notes updated: {notes_updated}
- Notes deleted: {notes_deleted}
- Todos completed: {todos_completed}
- Todos pending: {todos_pending}
- Reminders triggered: {reminders_triggered}
- Upcoming reminders: {reminders_due}
- Overdue reminders: {reminders_overdue}

📝 Recent note titles:
{chr(10).join(f'- {title}' for title in recent_titles if title)}

Please provide:

1. **Overview** (2-3 sentences): Summarize their overall productivity and activity level

2. **Insights** (2-3 sentences): Identify patterns, strengths, or areas that need attention

3. **Recommendations** (2-3 sentences): Provide actionable, encouraging suggestions to improve productivity

Keep the tone:
- Conversational and friendly
- Positive and encouraging
- Practical and actionable
- Use emojis sparingly (1-2 max)

Format as plain text paragraphs separated by blank lines."""

    return prompt


def generate_fallback_summary(data: Dict[str, Any]) -> str:
    """
    Generate a simple template-based summary if LiteLLM fails
    """
    notes = data.get('notes', {})
    todos = data.get('todos', {})
    reminders = data.get('reminders', {})

    notes_created = len(notes.get('created', []))
    notes_updated = len(notes.get('updated', []))
    todos_completed = len(todos.get('completed', []))
    reminders_due = len(reminders.get('due', []))
    reminders_overdue = len(reminders.get('overdue', []))

    summary = f"""📊 Activity Summary (Last 7 Days)

You've been productive this week! You created {notes_created} new notes and updated {notes_updated} existing ones.

{"Great job completing " + str(todos_completed) + " todos!" if todos_completed > 0 else "Keep working on those todos!"}

You have {reminders_due} upcoming reminders. {f"Don't forget about {reminders_overdue} overdue reminders!" if reminders_overdue > 0 else "Great job staying on top of your reminders!"}

Keep up the good work! Stay organized and you'll continue to be productive. 🎉"""

    return summary


def test_connection() -> Dict[str, Any]:
    """
    Test LiteLLM connection to Azure OpenAI via Webex
    """
    try:
        response = litellm.completion(
            model=MODEL,
            messages=[{"role": "user", "content": "Hello, this is a test. Reply with 'Connection successful' in 3 words."}],
            max_tokens=20,
            timeout=10
        )

        return {
            "success": True,
            "message": "LiteLLM connection successful via Webex LLM Proxy",
            "model": MODEL,
            "response": response.choices[0].message.content,
            "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT")
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Connection failed: {str(e)}",
            "model": MODEL,
            "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
            "error_type": type(e).__name__
        }


# Test on module import (for debugging)
if __name__ == "__main__":
    print("🧪 Testing LiteLLM connection to Azure OpenAI via Webex...")
    result = test_connection()
    print(f"✅ Success: {result['success']}")
    print(f"📝 Message: {result['message']}")
    if result['success']:
        print(f"💬 Response: {result['response']}")
    else:
        print(f"❌ Error Type: {result.get('error_type', 'Unknown')}")
