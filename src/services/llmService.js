/**
 * LLM Service - LiteLLM Backend Integration
 * Generates AI-powered summaries using Azure OpenAI via Webex LLM Proxy
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const requestBackendSummary = async (summaryData) => {
  const response = await fetch(`${BACKEND_URL}/api/generate-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(summaryData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Backend API request failed');
  }

  const data = await response.json();

  if (!data.success || !data.summary) {
    throw new Error('Invalid response from backend');
  }

  return data.summary;
};

/**
 * Generate AI summary from user data
 * @param {Object} summaryData - Aggregated summary data
 * @returns {Promise<{text: string, source: string}>} AI-generated summary text
 */
export const generateSummary = async (summaryData) => {
  try {
    // Transform summaryData to match backend API format
    const backendPayload = {
      notes: {
        created: summaryData.notes.created,
        updated: summaryData.notes.updated,
        deleted: summaryData.notes.deleted
      },
      todos: {
        completed: summaryData.todos.completed,
        pending: summaryData.todos.pending
      },
      reminders: {
        triggered: summaryData.reminders.triggered,
        due: summaryData.reminders.due,
        overdue: summaryData.reminders.overdue
      }
    };

    const text = await requestBackendSummary(backendPayload);
    return {
      text,
      source: 'Azure OpenAI (LiteLLM)',
    };
  } catch (error) {
    console.warn('Backend AI summary unavailable, using fallback:', error.message);
    return {
      text: generateFallbackSummary(summaryData),
      source: 'Local Fallback',
    };
  }
};

// Prompt creation is now handled by the backend

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
  try {
    const response = await fetch(`${BACKEND_URL}/api/test-connection`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.warn('Backend API test failed:', error.message);
    return false;
  }
};

/**
 * Get API key status
 * @returns {Object} Status information
 */
export const getAPIKeyStatus = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/token-status`);
    const data = await response.json();
    return {
      configured: data.token_configured,
      valid: data.token_configured && data.endpoint_configured,
      endpoint: data.endpoint,
      deployment: data.deployment
    };
  } catch (error) {
    console.warn('Failed to get backend status:', error.message);
    return {
      configured: false,
      valid: false,
      endpoint: 'Unknown',
      deployment: 'Unknown'
    };
  }
};
