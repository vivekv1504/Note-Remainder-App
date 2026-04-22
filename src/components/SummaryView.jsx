import { useState, useEffect } from 'react';
import { getSummaryData, getSummaryStats } from '../services/summaryService';
import { generateSummary, getAPIKeyStatus } from '../services/llmService';
import './SummaryView.css';

export const SummaryView = ({ notes, deletedNotes, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummarySource, setAiSummarySource] = useState('Gemini AI');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [notes, deletedNotes]);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check API key status first
      const keyStatus = getAPIKeyStatus();
      if (!keyStatus.configured) {
        throw new Error('Gemini API key not configured. Please check your .env file.');
      }

      // Get aggregated data
      const data = getSummaryData(notes, deletedNotes, 7);
      setSummaryData(data);

      // Generate AI summary
      const summary = await generateSummary(data);
      if (typeof summary === 'string') {
        setAiSummary(summary);
        setAiSummarySource('Local Fallback');
      } else {
        setAiSummary(summary.text || '');
        setAiSummarySource(summary.source || 'Gemini AI');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate summary. Please try again.');
      console.error('Summary generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="summary-view">
        <div className="summary-header">
          <button className="back-btn" onClick={onBack}>‹</button>
          <h2 className="summary-title">📊 AI Summary</h2>
        </div>
        <div className="summary-loading">
          <div className="spinner"></div>
          <p>Analyzing your data...</p>
          <p className="loading-subtext">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="summary-view">
        <div className="summary-header">
          <button className="back-btn" onClick={onBack}>‹</button>
          <h2 className="summary-title">📊 AI Summary</h2>
        </div>
        <div className="summary-error">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={loadSummary} className="retry-btn">
              🔄 Try Again
            </button>
            <button onClick={onBack} className="back-btn-secondary">
              ← Go Back
            </button>
          </div>
          {error.includes('API key') && (
            <div className="error-help">
              <p><strong>Need help?</strong></p>
              <p>Get your free API key from:</p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="help-link"
              >
                🔗 Google AI Studio
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No data state
  if (!summaryData || summaryData.notes.total === 0) {
    return (
      <div className="summary-view">
        <div className="summary-header">
          <button className="back-btn" onClick={onBack}>‹</button>
          <h2 className="summary-title">📊 AI Summary</h2>
        </div>
        <div className="summary-empty">
          <div className="empty-icon">📝</div>
          <h3>No data to summarize</h3>
          <p>Start creating notes and reminders to see your AI-powered insights!</p>
          <button onClick={onBack} className="back-btn-secondary">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const stats = getSummaryStats(summaryData);

  // Main summary view
  return (
    <div className="summary-view">
      <div className="summary-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <h2 className="summary-title">📊 AI Summary</h2>
        <button
          onClick={handleRefresh}
          className="refresh-btn"
          disabled={refreshing}
          title="Refresh summary"
        >
          {refreshing ? '⏳' : '🔄'}
        </button>
      </div>

      <div className="summary-content">
        {/* Period Info */}
        <div className="period-badge">
          Last {summaryData.period.days} days
        </div>

        {/* AI Generated Summary */}
        <div className="summary-card ai-summary-card">
          <h3>🤖 AI Insights</h3>
          <div className="ai-summary-text">
            {aiSummary}
          </div>
          <div className="ai-badge">
            <span className="badge-icon">✨</span>
            {aiSummarySource === 'Gemini AI' ? 'Powered by Gemini AI' : 'Source: Local Fallback'}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card metric-notes">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-value">{stats.notesCreated}</div>
              <div className="metric-label">Notes Created</div>
            </div>
          </div>

          <div className="metric-card metric-updates">
            <div className="metric-icon">✏️</div>
            <div className="metric-content">
              <div className="metric-value">{stats.notesUpdated}</div>
              <div className="metric-label">Notes Updated</div>
            </div>
          </div>

          <div className="metric-card metric-todos">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-value">{stats.todosCompleted}</div>
              <div className="metric-label">Todos Completed</div>
            </div>
          </div>

          <div className="metric-card metric-reminders">
            <div className="metric-icon">🔔</div>
            <div className="metric-content">
              <div className="metric-value">{stats.remindersTriggered}</div>
              <div className="metric-label">Reminders Fired</div>
            </div>
          </div>

          <div className="metric-card metric-score">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-value">{stats.productivityScore}</div>
              <div className="metric-label">Productivity Score</div>
            </div>
          </div>

          <div className="metric-card metric-streak">
            <div className="metric-icon">🔥</div>
            <div className="metric-content">
              <div className="metric-value">{stats.streakDays}</div>
              <div className="metric-label">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Overdue Reminders Alert */}
        {stats.remindersOverdue > 0 && (
          <div className="alert-card overdue-alert">
            <div className="alert-header">
              <span className="alert-icon">⚠️</span>
              <h4>Overdue Reminders</h4>
            </div>
            <p>You have <strong>{stats.remindersOverdue}</strong> overdue reminder{stats.remindersOverdue > 1 ? 's' : ''} that need your attention:</p>
            <ul className="overdue-list">
              {summaryData.reminders.overdue.slice(0, 5).map((r, index) => (
                <li key={index}>
                  <span className="overdue-title">{r.noteTitle}</span>
                  <span className="overdue-days">{r.daysOverdue} day{r.daysOverdue > 1 ? 's' : ''} overdue</span>
                </li>
              ))}
            </ul>
            {summaryData.reminders.overdue.length > 5 && (
              <p className="overdue-more">
                +{summaryData.reminders.overdue.length - 5} more overdue
              </p>
            )}
          </div>
        )}

        {/* Upcoming Reminders */}
        {stats.remindersUpcoming > 0 && (
          <div className="summary-card upcoming-card">
            <h3>📅 Coming Up</h3>
            <p className="upcoming-subtitle">
              Next {stats.remindersUpcoming} reminder{stats.remindersUpcoming > 1 ? 's' : ''} in the next 7 days
            </p>
            <ul className="reminder-list">
              {summaryData.reminders.upcoming.slice(0, 5).map((r, index) => {
                const reminderDate = new Date(r.reminderTime);
                const isToday = reminderDate.toDateString() === new Date().toDateString();
                const isTomorrow = reminderDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                let dateLabel;
                if (isToday) dateLabel = 'Today';
                else if (isTomorrow) dateLabel = 'Tomorrow';
                else dateLabel = `in ${r.daysUntil} day${r.daysUntil > 1 ? 's' : ''}`;

                return (
                  <li key={index} className={isToday ? 'reminder-today' : ''}>
                    <div className="reminder-info">
                      <span className="reminder-title">{r.noteTitle}</span>
                      <span className="reminder-date">{dateLabel}</span>
                    </div>
                    <span className="reminder-time">
                      {reminderDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Activity Summary */}
        <div className="summary-card activity-card">
          <h3>📈 Activity Breakdown</h3>
          <div className="activity-stats">
            <div className="activity-stat">
              <span className="activity-label">Total Notes</span>
              <span className="activity-value">{stats.totalNotes}</span>
            </div>
            <div className="activity-stat">
              <span className="activity-label">Deleted</span>
              <span className="activity-value">{stats.notesDeleted}</span>
            </div>
            <div className="activity-stat">
              <span className="activity-label">Pending Todos</span>
              <span className="activity-value">{stats.todosPending}</span>
            </div>
            <div className="activity-stat">
              <span className="activity-label">Due Reminders</span>
              <span className="activity-value">{stats.remindersDue}</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="summary-card insights-card">
          <h3>💡 Patterns & Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon">📅</span>
              <div className="insight-content">
                <div className="insight-label">Most Active Day</div>
                <div className="insight-value">{summaryData.insights.mostActiveDay}</div>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">⏰</span>
              <div className="insight-content">
                <div className="insight-label">Most Active Time</div>
                <div className="insight-value">{summaryData.insights.mostActiveTime}</div>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">📊</span>
              <div className="insight-content">
                <div className="insight-label">Average Notes/Day</div>
                <div className="insight-value">{summaryData.insights.averageNotesPerDay}</div>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">✅</span>
              <div className="insight-content">
                <div className="insight-label">Completion Rate</div>
                <div className="insight-value">{summaryData.insights.completionRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="summary-footer">
          <p className="footer-text">
            Summary generated on {new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
