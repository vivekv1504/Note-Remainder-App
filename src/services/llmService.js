/**
 * LLM Service - Gemini API Integration
 * Generates AI-powered summaries using Google's Gemini Flash models
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const buildGeminiEndpoint = (model) => `${GEMINI_API_BASE}/${model}:generateContent`;

const requestGeminiSummary = async (prompt) => {
  let lastErrorMessage = 'API request failed';

  for (const model of GEMINI_MODEL_CANDIDATES) {
    const response = await fetch(`${buildGeminiEndpoint(model)}?key=${GEMINI_API_KEY.trim()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        return aiText;
      }

      lastErrorMessage = 'No response from AI';
      continue;
    }

    const errorData = await response.json().catch(() => null);
    lastErrorMessage = errorData?.error?.message || 'API request failed';

    // Retired or unsupported models should fall through to the next candidate.
    if (response.status === 404 || response.status === 400) {
      continue;
    }

    throw new Error(lastErrorMessage);
  }

  throw new Error(lastErrorMessage);
};

/**
 * Generate AI summary from user data
 * @param {Object} summaryData - Aggregated summary data
 * @returns {Promise<{text: string, source: string}>} AI-generated summary text
 */
export const generateSummary = async (summaryData) => {
  // Validate API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
    return {
      text: generateFallbackSummary(summaryData),
      source: 'Local Fallback',
    };
  }

  const prompt = createPrompt(summaryData);

  try {
    const text = await requestGeminiSummary(prompt);
    return {
      text,
      source: 'Gemini AI',
    };
  } catch (error) {
    console.warn('Gemini summary unavailable, using fallback summary:', error.message);
    return {
      text: generateFallbackSummary(summaryData),
      source: 'Local Fallback',
    };
  }
};

/**
 * Create effective prompt for Gemini
 * @param {Object} data - Summary data
 * @returns {string} Formatted prompt
 */
const createPrompt = (data) => {
  const stats = {
    notesCreated: data.notes.created.length,
    notesUpdated: data.notes.updated.length,
    notesDeleted: data.notes.deleted.length,
    todosCompleted: data.todos.completed.length,
    todosPending: data.todos.pending,
    remindersTriggered: data.reminders.triggered.length,
    remindersDue: data.reminders.due.length,
    remindersOverdue: data.reminders.overdue.length,
    productivityScore: data.insights.productivityScore,
    streakDays: data.insights.streakDays,
    mostActiveDay: data.insights.mostActiveDay,
    mostActiveTime: data.insights.mostActiveTime,
    averagePerDay: data.insights.averageNotesPerDay,
    completionRate: data.insights.completionRate
  };

  // Get recent note titles
  const recentTitles = data.notes.created
    .slice(0, 5)
    .map(n => n.title)
    .filter(t => t && t.trim())
    .join('\n- ');

  // Get overdue reminder titles
  const overdueTitles = data.reminders.overdue
    .slice(0, 3)
    .map(r => r.noteTitle)
    .filter(t => t && t.trim())
    .join('\n- ');

  return `You are a friendly and insightful productivity assistant. Analyze this user's note-taking and reminder activity for the last 7 days and provide a warm, encouraging summary.

📊 ACTIVITY DATA:

Notes:
- Created: ${stats.notesCreated}
- Updated: ${stats.notesUpdated}
- Deleted: ${stats.notesDeleted}

Todos:
- Completed: ${stats.todosCompleted}
- Pending: ${stats.todosPending}
- Completion Rate: ${stats.completionRate}%

Reminders:
- Triggered (completed): ${stats.remindersTriggered}
- Upcoming: ${stats.remindersDue}
- Overdue: ${stats.remindersOverdue}

Insights:
- Productivity Score: ${stats.productivityScore}/100
- Active Streak: ${stats.streakDays} days
- Most Active Day: ${stats.mostActiveDay}
- Most Active Time: ${stats.mostActiveTime}
- Average Notes/Day: ${stats.averagePerDay}

${recentTitles ? `Recent Note Titles:\n- ${recentTitles}\n` : ''}
${overdueTitles ? `Overdue Reminders:\n- ${overdueTitles}\n` : ''}

INSTRUCTIONS:
1. Start with a brief, friendly greeting and overview (2-3 sentences)
2. Highlight 2-3 positive patterns or achievements
3. If there are overdue reminders, gently mention them
4. Provide 2-3 actionable recommendations to improve productivity
5. End with encouragement

TONE: Conversational, positive, helpful, and motivating
LENGTH: 4-6 short paragraphs
EMOJIS: Use sparingly (1-2 max)

Write the summary now:`;
};

/**
 * Generate fallback summary when API fails
 * @param {Object} data - Summary data
 * @returns {string} Template-based summary
 */
const generateFallbackSummary = (data) => {
  const stats = {
    notesCreated: data.notes.created.length,
    notesUpdated: data.notes.updated.length,
    todosCompleted: data.todos.completed.length,
    remindersDue: data.reminders.due.length,
    remindersOverdue: data.reminders.overdue.length,
    productivityScore: data.insights.productivityScore,
    streakDays: data.insights.streakDays
  };

  let summary = `📊 Activity Summary for the Last 7 Days\n\n`;

  // Overview
  summary += `You've been productive! `;
  if (stats.notesCreated > 0) {
    summary += `You created ${stats.notesCreated} new ${stats.notesCreated === 1 ? 'note' : 'notes'}`;
  }
  if (stats.notesUpdated > 0) {
    summary += ` and updated ${stats.notesUpdated} existing ${stats.notesUpdated === 1 ? 'one' : 'ones'}`;
  }
  summary += `.\n\n`;

  // Todos
  if (stats.todosCompleted > 0) {
    summary += `Great job completing ${stats.todosCompleted} ${stats.todosCompleted === 1 ? 'todo' : 'todos'}! `;
  }

  // Reminders
  if (stats.remindersDue > 0) {
    summary += `You have ${stats.remindersDue} upcoming ${stats.remindersDue === 1 ? 'reminder' : 'reminders'}. `;
  }

  if (stats.remindersOverdue > 0) {
    summary += `\n\n⚠️ Don't forget about ${stats.remindersOverdue} overdue ${stats.remindersOverdue === 1 ? 'reminder' : 'reminders'}. Take a moment to review and reschedule them.`;
  } else {
    summary += `You're staying on top of your reminders!`;
  }

  // Productivity score
  summary += `\n\n`;
  if (stats.productivityScore >= 75) {
    summary += `Your productivity score is ${stats.productivityScore}/100 - excellent work! `;
  } else if (stats.productivityScore >= 50) {
    summary += `Your productivity score is ${stats.productivityScore}/100 - you're doing well! `;
  } else {
    summary += `Your productivity score is ${stats.productivityScore}/100. There's room for improvement! `;
  }

  // Streak
  if (stats.streakDays > 0) {
    summary += `You've maintained a ${stats.streakDays}-day streak of creating notes. Keep it up!`;
  }

  // Recommendations
  summary += `\n\n💡 Suggestions:\n`;
  if (stats.remindersOverdue > 0) {
    summary += `• Review and reschedule overdue reminders\n`;
  }
  if (stats.notesCreated < 3) {
    summary += `• Try to create more notes to capture your thoughts\n`;
  }
  if (stats.todosCompleted === 0 && data.todos.total > 0) {
    summary += `• Focus on completing at least one todo today\n`;
  }

  summary += `\nKeep up the great work! 🎉`;

  return summary;
};

/**
 * Test API connection
 * @returns {Promise<boolean>} True if API is working
 */
export const testAPIConnection = async () => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
    return false;
  }

  try {
    await requestGeminiSummary("Say 'API is working' in 3 words.");
    return true;
  } catch (error) {
    console.warn('Gemini API test failed:', error.message);
    return false;
  }
};

/**
 * Get API key status
 * @returns {Object} Status information
 */
export const getAPIKeyStatus = () => {
  const hasKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here';
  const keyLength = GEMINI_API_KEY ? GEMINI_API_KEY.trim().length : 0;
  const keyPrefix = GEMINI_API_KEY ? GEMINI_API_KEY.trim().substring(0, 4) : '';

  return {
    configured: hasKey,
    valid: hasKey && keyLength === 39 && keyPrefix === 'AIza',
    length: keyLength,
    prefix: keyPrefix
  };
};
