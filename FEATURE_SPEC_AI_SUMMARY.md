# Feature Specification: AI-Powered Data Summary

## Document Information
- **Feature Name**: AI Data Summary & Analytics
- **Version**: 1.0
- **Date**: April 20, 2026
- **Status**: Specification Phase
- **Approach**: Specification-Driven Development (SDD)

---

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [Business Requirements](#business-requirements)
3. [Technical Specifications](#technical-specifications)
4. [Implementation Plan](#implementation-plan)
5. [LLM Integration Guide](#llm-integration-guide)
6. [Testing Strategy](#testing-strategy)
7. [Step-by-Step Implementation Instructions](#step-by-step-implementation-instructions)

---

## Feature Overview

### What is This Feature?
An AI-powered summary button that analyzes user's notes and reminders to provide intelligent insights about:
- Recently updated notes/todos
- Recently created notes/todos
- Recently removed/deleted notes/todos
- Recently triggered reminders (completed reminders)
- Due reminders (upcoming/pending)
- Patterns and productivity insights

### Why This Feature?
- **User Value**: Quick overview of activity without scrolling through lists
- **Productivity**: Identify what needs attention
- **Insights**: Understand usage patterns
- **AI Enhancement**: Natural language summaries instead of raw data

---

## Business Requirements

### BR-001: Summary Button
**Requirement**: Add a "Summarize" button in the Profile page under "Other settings"  
**Priority**: High  
**Acceptance Criteria**:
- Button appears below "Contact Support" in profile
- Button navigates to Summary view
- Button has icon (📊 or 🤖)

### BR-002: Data Analysis
**Requirement**: System must analyze user's data for the following metrics  
**Priority**: High  
**Acceptance Criteria**:
- Count recently created notes (last 7 days)
- Count recently updated notes (last 7 days)
- Count recently deleted notes (last 7 days)
- Count triggered reminders (past reminders)
- Count due reminders (upcoming reminders)
- Identify most active day/time

### BR-003: AI-Generated Summary
**Requirement**: Use LLM to generate natural language summary  
**Priority**: High  
**Acceptance Criteria**:
- Summary is in conversational tone
- Summary highlights key insights
- Summary includes recommendations
- Summary is 3-5 paragraphs
- Generated in under 3 seconds

### BR-004: Fake Data Generation
**Requirement**: Provide testing mode with AI-generated fake data  
**Priority**: Medium  
**Acceptance Criteria**:
- Toggle button to enable test mode
- Generate realistic fake notes/todos
- Generate fake reminder history
- Clear test data easily

---

## Technical Specifications

### TS-001: Data Structure

#### Summary Data Model
```typescript
interface SummaryData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  
  notes: {
    total: number;
    created: Note[];
    updated: Note[];
    deleted: DeletedNote[];
  };
  
  todos: {
    total: number;
    created: Note[];
    completed: Note[];
    pending: number;
  };
  
  reminders: {
    triggered: Reminder[];
    due: Reminder[];
    overdue: Reminder[];
    upcoming: Reminder[];
  };
  
  insights: {
    mostActiveDay: string;
    mostActiveTime: string;
    productivityScore: number;
    streakDays: number;
  };
}

interface Reminder {
  noteId: string;
  noteTitle: string;
  reminderTime: string;
  triggered: boolean;
  triggeredAt?: string;
}
```

### TS-002: LLM Integration Options

#### Option A: Gemini API (Recommended - Free Tier Available)
```javascript
// Google Gemini AI
Service: Gemini 1.5 Flash
Endpoint: https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent
API Key: Free tier - 15 requests/minute
Cost: FREE (up to 1500 requests/day)
Response Time: ~1-2 seconds
```

#### Option B: OpenAI API
```javascript
// OpenAI GPT
Service: GPT-4 or GPT-3.5 Turbo
Endpoint: https://api.openai.com/v1/chat/completions
API Key: Requires paid account
Cost: ~$0.002 per request (GPT-3.5)
Response Time: ~2-3 seconds
```

#### Option C: Anthropic Claude API
```javascript
// Claude API (Current session uses this)
Service: Claude 3.5 Sonnet
Endpoint: https://api.anthropic.com/v1/messages
API Key: Requires paid account
Cost: ~$0.015 per request
Response Time: ~1-2 seconds
```

#### Option D: Local/Free Alternatives
```javascript
// Hugging Face Inference API (Free)
Service: Various models (FLAN-T5, GPT-2, etc.)
Endpoint: https://api-inference.huggingface.co/models/
API Key: Free tier available
Cost: FREE
Response Time: ~3-5 seconds
```

**Recommendation**: Use **Gemini 1.5 Flash** for free tier with good performance

---

## Implementation Plan

### Phase 1: Data Collection Layer (Week 1)

#### Step 1.1: Create Summary Data Service
- Create `src/services/summaryService.js`
- Implement data aggregation functions
- Calculate metrics from existing notes

#### Step 1.2: Enhance Data Storage
- Add timestamp tracking for updates
- Add reminder trigger history
- Store deletion timestamps

#### Step 1.3: Create Analytics Functions
```javascript
// Functions to implement:
- getRecentNotes(days)
- getRecentUpdates(days)
- getRecentDeletes(days)
- getTriggeredReminders(days)
- getDueReminders()
- getOverdueReminders()
- calculateInsights()
```

### Phase 2: UI Components (Week 2)

#### Step 2.1: Create Summary Button
- Add button in ProfilePage.jsx
- Create navigation to summary view
- Add icon and styling

#### Step 2.2: Create Summary View Component
- Create `src/components/SummaryView.jsx`
- Display loading state
- Show summary sections
- Add refresh button

#### Step 2.3: Create Data Visualization
- Create charts/graphs (optional)
- Show metrics in cards
- Color-coded indicators

### Phase 3: LLM Integration (Week 3)

#### Step 3.1: Set Up API Client
- Create `src/services/llmService.js`
- Configure API endpoints
- Handle authentication
- Implement retry logic

#### Step 3.2: Create Prompt Engineering
- Design effective prompts
- Include data formatting
- Request specific output format
- Handle edge cases

#### Step 3.3: Implement Summary Generation
- Send data to LLM
- Parse response
- Display formatted summary
- Cache results

### Phase 4: Fake Data Generator (Week 4)

#### Step 4.1: Create Test Data Generator
- Create `src/utils/fakeDataGenerator.js`
- Generate realistic notes
- Generate todos with timestamps
- Generate reminder history

#### Step 4.2: Add Testing UI
- Add "Test Mode" toggle
- "Generate Test Data" button
- "Clear Test Data" button
- Show test data indicator

---

## LLM Integration Guide

### Setup: Gemini AI (Recommended)

#### Step 1: Get API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Store in `.env` file

#### Step 2: Create Environment File
```bash
# Create .env file in project root
VITE_GEMINI_API_KEY=your_api_key_here
```

#### Step 3: Install HTTP Client (if needed)
```bash
npm install axios
# or use fetch (built-in)
```

#### Step 4: Create LLM Service File

**File**: `src/services/llmService.js`

```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export const generateSummary = async (summaryData) => {
  const prompt = createPrompt(summaryData);
  
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('LLM Error:', error);
    return generateFallbackSummary(summaryData);
  }
};

const createPrompt = (data) => {
  return `You are a helpful productivity assistant. Analyze this user's note-taking activity and provide a friendly, insightful summary.

Data for last 7 days:
- Notes created: ${data.notes.created.length}
- Notes updated: ${data.notes.updated.length}
- Notes deleted: ${data.notes.deleted.length}
- Todos completed: ${data.todos.completed.length}
- Reminders triggered: ${data.reminders.triggered.length}
- Upcoming reminders: ${data.reminders.due.length}
- Overdue reminders: ${data.reminders.overdue.length}

Recent note titles:
${data.notes.created.map(n => `- ${n.title}`).join('\n')}

Please provide:
1. A brief overview of their activity (2-3 sentences)
2. Notable patterns or insights (2-3 sentences)
3. Friendly recommendations to improve productivity (2-3 sentences)

Keep the tone conversational, positive, and encouraging. Use emojis sparingly.`;
};

const generateFallbackSummary = (data) => {
  // Simple template-based summary if API fails
  return `📊 Summary for the last 7 days:

You've been productive! You created ${data.notes.created.length} notes and updated ${data.notes.updated.length} existing ones. 

You have ${data.reminders.due.length} upcoming reminders. ${data.reminders.overdue.length > 0 ? `Don't forget about ${data.reminders.overdue.length} overdue reminders!` : 'Great job staying on top of your reminders!'}

Keep up the good work! 🎉`;
};
```

---

## Step-by-Step Implementation Instructions

### 📋 Phase 1: Preparation (30 minutes)

#### 1.1 Create Feature Branch
```bash
git checkout -b feature/ai-summary
```

#### 1.2 Install Dependencies
```bash
npm install axios
# or use built-in fetch API (no installation needed)
```

#### 1.3 Set Up Environment Variables
```bash
# Create .env file
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# Add to .gitignore
echo ".env" >> .gitignore
```

#### 1.4 Get Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key and paste into `.env` file

---

### 📊 Phase 2: Data Layer (2-3 hours)

#### 2.1 Create Summary Service

**Create File**: `src/services/summaryService.js`

```javascript
// Aggregate user data for last N days
export const getSummaryData = (notes, deletedNotes, days = 7) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      days: days
    },
    notes: {
      total: notes.length,
      created: getRecentCreated(notes, startDate),
      updated: getRecentUpdated(notes, startDate),
      deleted: getRecentDeleted(deletedNotes, startDate)
    },
    todos: {
      total: notes.filter(n => n.type === 'todo').length,
      created: getRecentCreated(notes.filter(n => n.type === 'todo'), startDate),
      completed: getRecentCompleted(notes, startDate),
      pending: notes.filter(n => n.type === 'todo' && !n.completed).length
    },
    reminders: {
      triggered: getTriggeredReminders(notes, startDate),
      due: getDueReminders(notes),
      overdue: getOverdueReminders(notes),
      upcoming: getUpcomingReminders(notes, 7)
    },
    insights: calculateInsights(notes)
  };
};

// Helper functions
const getRecentCreated = (items, startDate) => {
  return items.filter(item => 
    item.createdAt && new Date(item.createdAt) >= startDate
  );
};

const getRecentUpdated = (items, startDate) => {
  return items.filter(item => 
    item.updatedAt && new Date(item.updatedAt) >= startDate
  );
};

const getRecentDeleted = (items, startDate) => {
  return items.filter(item => 
    item.deletedAt && new Date(item.deletedAt) >= startDate
  );
};

const getRecentCompleted = (items, startDate) => {
  return items.filter(item => 
    item.completed && item.completedAt && new Date(item.completedAt) >= startDate
  );
};

const getTriggeredReminders = (items, startDate) => {
  return items.filter(item => 
    item.reminderTriggeredAt && new Date(item.reminderTriggeredAt) >= startDate
  );
};

const getDueReminders = (items) => {
  const now = new Date();
  return items.filter(item => 
    item.reminderTime && new Date(item.reminderTime) >= now
  );
};

const getOverdueReminders = (items) => {
  const now = new Date();
  return items.filter(item => 
    item.reminderTime && 
    new Date(item.reminderTime) < now &&
    !item.reminderTriggeredAt &&
    !item.completed
  );
};

const getUpcomingReminders = (items, days) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return items.filter(item => 
    item.reminderTime && 
    new Date(item.reminderTime) >= now &&
    new Date(item.reminderTime) <= futureDate
  );
};

const calculateInsights = (items) => {
  // Calculate productivity metrics
  return {
    mostActiveDay: 'Monday', // TODO: Calculate from data
    mostActiveTime: '2:00 PM', // TODO: Calculate from data
    productivityScore: 75, // TODO: Calculate score
    streakDays: 5 // TODO: Calculate streak
  };
};
```

#### 2.2 Update Note Data Model

**Edit**: `src/App.jsx` or wherever notes are created

Add timestamps when creating/updating notes:
```javascript
const createNote = (title, body, reminderTime) => {
  const newNote = {
    id: Date.now().toString(),
    title,
    body,
    reminderTime,
    createdAt: new Date().toISOString(), // Add this
    updatedAt: new Date().toISOString(), // Add this
    completed: false
  };
  // ... save note
};

const updateNote = (id, updates) => {
  const updatedNote = {
    ...existingNote,
    ...updates,
    updatedAt: new Date().toISOString() // Add this
  };
  // ... save note
};

const deleteNote = (id) => {
  const deletedNote = {
    ...existingNote,
    deletedAt: new Date().toISOString() // Add this
  };
  // ... move to deletedNotes
};
```

---

### 🤖 Phase 3: LLM Integration (2-3 hours)

#### 3.1 Create LLM Service

**Create File**: `src/services/llmService.js`

Copy the code from the "LLM Integration Guide" section above.

#### 3.2 Test LLM Service

**Create Test File**: `src/services/llmService.test.js`

```javascript
import { generateSummary } from './llmService';

const testData = {
  notes: {
    created: [
      { title: 'Meeting notes', createdAt: new Date().toISOString() },
      { title: 'Project ideas', createdAt: new Date().toISOString() }
    ],
    updated: [{ title: 'Todo list', updatedAt: new Date().toISOString() }],
    deleted: []
  },
  todos: {
    completed: [{ title: 'Buy milk', completedAt: new Date().toISOString() }],
    pending: 3
  },
  reminders: {
    triggered: [{ noteTitle: 'Dentist', triggeredAt: new Date().toISOString() }],
    due: [{ noteTitle: 'Team meeting', reminderTime: new Date().toISOString() }],
    overdue: [],
    upcoming: [{ noteTitle: 'Submit report', reminderTime: new Date().toISOString() }]
  }
};

// Test the function
generateSummary(testData).then(summary => {
  console.log('Generated Summary:', summary);
});
```

Run test:
```bash
node src/services/llmService.test.js
```

---

### 🎨 Phase 4: UI Components (3-4 hours)

#### 4.1 Add Summary Button to Profile

**Edit**: `src/components/ProfilePage.jsx`

Add after Contact Support button:
```javascript
<button className="setting-item-nav" onClick={() => setShowSummary(true)}>
  <span className="setting-label">📊 AI Summary</span>
  <span className="nav-arrow">›</span>
</button>
```

Add state:
```javascript
const [showSummary, setShowSummary] = useState(false);
```

#### 4.2 Create Summary View Component

**Create File**: `src/components/SummaryView.jsx`

```javascript
import { useState, useEffect } from 'react';
import { getSummaryData } from '../services/summaryService';
import { generateSummary } from '../services/llmService';
import './SummaryView.css';

export const SummaryView = ({ notes, deletedNotes, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get data
      const data = getSummaryData(notes, deletedNotes, 7);
      setSummaryData(data);
      
      // Generate AI summary
      const summary = await generateSummary(data);
      setAiSummary(summary);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="summary-view">
        <div className="summary-header">
          <button className="back-btn" onClick={onBack}>‹</button>
          <h2 className="summary-title">AI Summary</h2>
        </div>
        <div className="summary-loading">
          <div className="spinner"></div>
          <p>Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-view">
        <div className="summary-header">
          <button className="back-btn" onClick={onBack}>‹</button>
          <h2 className="summary-title">AI Summary</h2>
        </div>
        <div className="summary-error">
          <p>{error}</p>
          <button onClick={loadSummary} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-view">
      <div className="summary-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <h2 className="summary-title">📊 AI Summary</h2>
        <button onClick={loadSummary} className="refresh-btn">🔄</button>
      </div>

      <div className="summary-content">
        {/* AI Generated Summary */}
        <div className="summary-card ai-summary-card">
          <h3>🤖 AI Insights</h3>
          <div className="ai-summary-text">
            {aiSummary}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>📝 Notes</h4>
            <div className="metric-value">{summaryData.notes.created.length}</div>
            <div className="metric-label">Created this week</div>
          </div>

          <div className="metric-card">
            <h4>✏️ Updates</h4>
            <div className="metric-value">{summaryData.notes.updated.length}</div>
            <div className="metric-label">Notes modified</div>
          </div>

          <div className="metric-card">
            <h4>🗑️ Deleted</h4>
            <div className="metric-value">{summaryData.notes.deleted.length}</div>
            <div className="metric-label">Recently removed</div>
          </div>

          <div className="metric-card">
            <h4>✅ Completed</h4>
            <div className="metric-value">{summaryData.todos.completed.length}</div>
            <div className="metric-label">Todos done</div>
          </div>

          <div className="metric-card">
            <h4>🔔 Triggered</h4>
            <div className="metric-value">{summaryData.reminders.triggered.length}</div>
            <div className="metric-label">Reminders fired</div>
          </div>

          <div className="metric-card">
            <h4>⏰ Due</h4>
            <div className="metric-value">{summaryData.reminders.due.length}</div>
            <div className="metric-label">Upcoming reminders</div>
          </div>
        </div>

        {/* Overdue Reminders Alert */}
        {summaryData.reminders.overdue.length > 0 && (
          <div className="alert-card overdue-alert">
            <h4>⚠️ Overdue Reminders</h4>
            <p>You have {summaryData.reminders.overdue.length} overdue reminders:</p>
            <ul>
              {summaryData.reminders.overdue.slice(0, 5).map(r => (
                <li key={r.noteId}>{r.noteTitle}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming Reminders */}
        {summaryData.reminders.upcoming.length > 0 && (
          <div className="summary-card">
            <h3>📅 Coming Up</h3>
            <ul className="reminder-list">
              {summaryData.reminders.upcoming.slice(0, 5).map(r => (
                <li key={r.noteId}>
                  <span className="reminder-title">{r.noteTitle}</span>
                  <span className="reminder-time">
                    {new Date(r.reminderTime).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### 4.3 Create CSS Styling

**Create File**: `src/components/SummaryView.css`

```css
.summary-view {
  padding: 0;
  min-height: 100vh;
  background: var(--bg-primary);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.summary-title {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.refresh-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: var(--border-color);
}

.summary-content {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.summary-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.summary-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.ai-summary-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
}

.ai-summary-card h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1.2rem;
}

.ai-summary-text {
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-card h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.alert-card {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

:root[data-theme='dark'] .alert-card {
  background: rgba(255, 152, 0, 0.1);
  border-color: #ff9800;
}

.overdue-alert h4 {
  margin: 0 0 0.75rem 0;
  color: #f57c00;
}

.overdue-alert ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.overdue-alert li {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.reminder-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reminder-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.reminder-list li:last-child {
  border-bottom: none;
}

.reminder-title {
  font-weight: 500;
  color: var(--text-primary);
}

.reminder-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.summary-error {
  text-align: center;
  padding: 4rem 2rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #5568d3;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metric-value {
    font-size: 2rem;
  }
}
```

#### 4.4 Integrate Summary View in ProfilePage

**Edit**: `src/components/ProfilePage.jsx`

Add at the top with other views:
```javascript
// Import
import { SummaryView } from './SummaryView';

// Add state
const [showSummary, setShowSummary] = useState(false);

// Add view before other conditionals
if (showSummary) {
  return (
    <SummaryView
      notes={notes}
      deletedNotes={deletedNotes}
      onBack={() => setShowSummary(false)}
    />
  );
}
```

---

### 🧪 Phase 5: Fake Data Generator (2-3 hours)

#### 5.1 Create Fake Data Generator

**Create File**: `src/utils/fakeDataGenerator.js`

```javascript
const FAKE_TITLES = [
  'Team Meeting Notes',
  'Project Brainstorm',
  'Weekly Goals',
  'Shopping List',
  'Birthday Party Plans',
  'Travel Itinerary',
  'Book Recommendations',
  'Recipe Ideas',
  'Workout Routine',
  'Budget Planning',
  'Code Review Notes',
  'Client Presentation',
  'Research Findings',
  'Blog Post Ideas',
  'Home Improvement',
  'Gift Ideas',
  'Study Schedule',
  'Meal Prep Plan',
  'Garden Planning',
  'Car Maintenance'
];

const FAKE_BODIES = [
  'Discussed Q2 objectives and team responsibilities. Follow up next week.',
  'Brainstormed new features for the app. Focus on user experience improvements.',
  'Set weekly milestones and tracked progress. Great momentum this week!',
  'Need to buy groceries, pick up dry cleaning, and schedule dentist appointment.',
  'Planning surprise party for Saturday. Ordered cake and sent invitations.',
  'Booked flights and hotels for summer vacation. Created daily itinerary.',
  'Finished three books this month. Adding five more to reading list.',
  'Trying new pasta recipes this week. Experiment with different sauces.',
  'Updated workout plan with focus on cardio. Track progress daily.',
  'Reviewed monthly expenses. Looking for ways to save on subscriptions.',
];

export const generateFakeNotes = (count = 10) => {
  const notes = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    // Random date within last 14 days
    const createdDaysAgo = Math.floor(Math.random() * 14);
    const createdAt = new Date(now - createdDaysAgo * 24 * 60 * 60 * 1000);
    
    // Some notes updated later
    const wasUpdated = Math.random() > 0.5;
    const updatedAt = wasUpdated 
      ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : createdAt;
    
    // Future reminder time (1-30 days from now)
    const reminderDaysAhead = Math.floor(Math.random() * 30) + 1;
    const reminderTime = new Date(now + reminderDaysAhead * 24 * 60 * 60 * 1000);
    reminderTime.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
    
    const note = {
      id: `fake-${Date.now()}-${i}`,
      title: FAKE_TITLES[Math.floor(Math.random() * FAKE_TITLES.length)],
      body: FAKE_BODIES[Math.floor(Math.random() * FAKE_BODIES.length)],
      reminderTime: reminderTime.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      completed: Math.random() > 0.7,
      type: Math.random() > 0.6 ? 'todo' : 'note',
      isFakeData: true // Mark as fake
    };
    
    // Some todos are completed
    if (note.type === 'todo' && note.completed) {
      note.completedAt = new Date(
        createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    
    // Some reminders were triggered
    if (Math.random() > 0.6) {
      note.reminderTriggeredAt = new Date(
        now - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    
    notes.push(note);
  }
  
  return notes;
};

export const generateFakeDeletedNotes = (count = 5) => {
  const deletedNotes = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const deletedDaysAgo = Math.floor(Math.random() * 7);
    const deletedAt = new Date(now - deletedDaysAgo * 24 * 60 * 60 * 1000);
    
    const note = {
      id: `fake-deleted-${Date.now()}-${i}`,
      title: FAKE_TITLES[Math.floor(Math.random() * FAKE_TITLES.length)],
      body: FAKE_BODIES[Math.floor(Math.random() * FAKE_BODIES.length)],
      deletedAt: deletedAt.toISOString(),
      isFakeData: true
    };
    
    deletedNotes.push(note);
  }
  
  return deletedNotes;
};

export const clearFakeData = (notes, deletedNotes) => {
  return {
    notes: notes.filter(n => !n.isFakeData),
    deletedNotes: deletedNotes.filter(n => !n.isFakeData)
  };
};
```

#### 5.2 Add Test Mode UI

**Create File**: `src/components/TestDataPanel.jsx`

```javascript
import { useState } from 'react';
import { generateFakeNotes, generateFakeDeletedNotes, clearFakeData } from '../utils/fakeDataGenerator';
import './TestDataPanel.css';

export const TestDataPanel = ({ onGenerateData, onClearData }) => {
  const [count, setCount] = useState(10);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = () => {
    const fakeNotes = generateFakeNotes(count);
    const fakeDeleted = generateFakeDeletedNotes(5);
    onGenerateData(fakeNotes, fakeDeleted);
    alert(`Generated ${count} fake notes and 5 deleted notes!`);
  };

  return (
    <div className="test-data-panel">
      <button 
        className="test-mode-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🧪 Test Mode {isOpen ? '▼' : '▶'}
      </button>
      
      {isOpen && (
        <div className="test-controls">
          <div className="test-input-group">
            <label>Number of notes:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
            />
          </div>
          
          <button className="generate-btn" onClick={handleGenerate}>
            Generate Fake Data
          </button>
          
          <button className="clear-btn" onClick={onClearData}>
            Clear Fake Data
          </button>
          
          <p className="test-note">
            ⚠️ Fake data is marked and won't persist after refresh
          </p>
        </div>
      )}
    </div>
  );
};
```

**Create File**: `src/components/TestDataPanel.css`

```css
.test-data-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
  background: var(--card-bg);
  border: 2px solid #ff9800;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.test-mode-toggle {
  padding: 0.75rem 1.25rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.test-controls {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 250px;
}

.test-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-input-group label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.test-input-group input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.generate-btn {
  padding: 0.75rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.generate-btn:hover {
  background: #45a049;
}

.clear-btn {
  padding: 0.75rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.clear-btn:hover {
  background: #d32f2f;
}

.test-note {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
}
```

---

### 🧪 Phase 6: Testing & Validation (1-2 hours)

#### 6.1 Manual Testing Checklist

```
□ API key is set correctly in .env
□ Summary button appears in profile
□ Clicking summary button opens summary view
□ Data metrics are calculated correctly
□ AI summary generates successfully
□ AI summary is readable and relevant
□ Loading state shows while generating
□ Error handling works if API fails
□ Refresh button regenerates summary
□ Back button returns to profile
□ Test mode generates fake data
□ Fake data appears in summary
□ Clear fake data removes test notes
□ Responsive design works on mobile
```

#### 6.2 Create Test Cases

Add to existing TEST_CASES.md:

```markdown
## Test Case 11: AI Summary Generation

**Test Case ID**: TC_AI_001  
**Priority**: High  

### Steps
1. Go to Profile
2. Click "AI Summary"
3. Wait for loading
4. Verify metrics display
5. Verify AI text is readable
6. Check for overdue alerts

### Expected
- Summary generates in <3 seconds
- AI text is conversational
- Metrics are accurate
- No errors in console
```

---

## Testing Strategy

### Unit Tests
- Test summaryService functions
- Test fakeDataGenerator
- Test LLM prompt creation

### Integration Tests
- Test API connectivity
- Test data flow from App → SummaryView
- Test error handling

### E2E Tests
- Test full user journey
- Test with real and fake data
- Test on different screen sizes

---

## Deployment Checklist

```
□ API key stored securely
□ .env file in .gitignore
□ Error handling implemented
□ Loading states added
□ Fallback summary works
□ Mobile responsive
□ Documentation updated
□ Test cases written
□ Performance optimized
□ Security reviewed
```

---

## Success Metrics

- **Performance**: Summary generates in <3 seconds
- **Quality**: AI summary is relevant 90%+ of time
- **Usability**: Users can understand summary without help
- **Reliability**: API success rate >95%
- **Cost**: Stay within free tier limits

---

## Future Enhancements

### V2 Features
- Export summary as PDF
- Email summary weekly
- Custom date ranges
- Comparison charts
- Productivity trends
- Goal tracking
- Team summaries (if multi-user)

---

## References

- [Gemini API Docs](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [React Best Practices](https://react.dev/learn)

---

**Document Status**: Ready for Implementation  
**Estimated Total Time**: 2-3 days  
**Complexity**: Medium-High  
**Dependencies**: Gemini API Key, Updated data models
