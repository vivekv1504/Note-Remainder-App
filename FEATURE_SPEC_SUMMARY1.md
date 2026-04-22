# Feature Specification: Summary & Analytics Dashboard

## Document Information
**Feature Name**: Summary & Analytics Dashboard  
**Version**: 1.0  
**Date**: April 20, 2026  
**Status**: Specification  
**Priority**: High  

---

## Table of Contents
1. [Overview](#overview)
2. [Feature Requirements](#feature-requirements)
3. [Business Rules](#business-rules)
4. [Technical Specifications](#technical-specifications)
5. [Implementation Steps](#implementation-steps)
6. [LLM Integration](#llm-integration)
7. [Testing Strategy](#testing-strategy)
8. [Data Models](#data-models)

---

## Overview

### Purpose
Provide users with an intelligent summary of their notes and todos activity, including:
- Recent updates and creations
- Recently deleted items
- Triggered reminders
- Upcoming/due reminders
- AI-generated insights using LLM

### Goals
- Help users understand their productivity patterns
- Surface important upcoming reminders
- Provide actionable insights
- Enhance user engagement with data-driven summaries

### User Stories

**US-1**: As a user, I want to see a summary of my recent note activity so I can track my productivity.

**US-2**: As a user, I want to know which reminders are due soon so I don't miss important tasks.

**US-3**: As a user, I want to see recently triggered reminders so I can verify they worked correctly.

**US-4**: As a user, I want AI-generated insights about my notes so I can better organize my tasks.

---

## Feature Requirements

### FR-1: Summary Dashboard
**Priority**: High  
**Description**: A dedicated view that displays analytics about notes and todos

#### Sub-Requirements:
- FR-1.1: Display count of recently created notes/todos (last 7 days)
- FR-1.2: Display count of recently updated notes/todos (last 7 days)
- FR-1.3: Display count of recently deleted notes/todos (last 7 days)
- FR-1.4: Show list of upcoming reminders (next 24 hours)
- FR-1.5: Show list of overdue reminders
- FR-1.6: Show recently triggered reminders (last 24 hours)

### FR-2: Summary Button
**Priority**: High  
**Description**: Easy access button to view summary

#### Sub-Requirements:
- FR-2.1: Button visible in Profile page
- FR-2.2: Button shows summary icon and label
- FR-2.3: Button navigates to Summary Dashboard
- FR-2.4: Badge showing count of due reminders (if any)

### FR-3: LLM Integration
**Priority**: Medium  
**Description**: AI-generated insights using Language Model

#### Sub-Requirements:
- FR-3.1: Generate summary text based on user's notes data
- FR-3.2: Provide productivity insights
- FR-3.3: Suggest task prioritization
- FR-3.4: Handle API failures gracefully
- FR-3.5: Cache AI responses to reduce API calls

### FR-4: Fake Data Generator
**Priority**: High  
**Description**: Generate realistic test data for development

#### Sub-Requirements:
- FR-4.1: Create sample notes with various dates
- FR-4.2: Create sample todos with different statuses
- FR-4.3: Generate reminders (past, present, future)
- FR-4.4: Simulate deleted notes
- FR-4.5: One-click data generation for testing

---

## Business Rules

### BR-1: Time Windows
- **Recently Created**: Within last 7 days
- **Recently Updated**: Modified within last 7 days
- **Recently Deleted**: Deleted within last 7 days
- **Recent Reminders**: Triggered within last 24 hours
- **Upcoming Reminders**: Due within next 24 hours
- **Overdue Reminders**: Past due date and not completed

### BR-2: Data Calculation Rules
- **Created Count**: Notes/todos with `createdAt` within last 7 days
- **Updated Count**: Notes/todos with `updatedAt` > `createdAt` and within last 7 days
- **Deleted Count**: Items in `deletedNotes` array deleted within last 7 days
- **Triggered Count**: Reminders where `lastTriggered` timestamp within last 24 hours
- **Due Count**: Reminders where `reminderTime` < current time and `completed` = false

### BR-3: Priority Rules
Reminders are prioritized by:
1. **Critical**: Overdue by > 24 hours
2. **High**: Overdue by 0-24 hours
3. **Medium**: Due within next 6 hours
4. **Low**: Due within 6-24 hours

### BR-4: Display Rules
- Show maximum 10 items per list
- Sort by date (most recent first)
- Display relative time (e.g., "2 hours ago", "tomorrow")
- Use color coding for priority levels
- Empty states with helpful messages

### BR-5: LLM Rules
- **Max Input**: 1000 characters of note data
- **Cache Duration**: 1 hour
- **Fallback**: Show static insights if API fails
- **Rate Limit**: Max 10 requests per hour per user
- **Privacy**: Don't send sensitive data to LLM

---

## Technical Specifications

### TS-1: Component Structure

```
Summary Dashboard
├── SummaryHeader (title, refresh button)
├── SummaryStats (cards with counts)
├── UpcomingReminders (list component)
├── OverdueReminders (list component)
├── RecentActivity (timeline component)
└── AIInsights (LLM-generated content)
```

### TS-2: Data Flow

```
User clicks "Summary" button
    ↓
Load notes, todos, deletedNotes from state/storage
    ↓
Calculate statistics (created, updated, deleted counts)
    ↓
Filter reminders (upcoming, overdue, triggered)
    ↓
Send summary to LLM API (optional)
    ↓
Render dashboard with all data
```

### TS-3: State Management

```javascript
const [summaryData, setSummaryData] = useState({
  stats: {
    createdCount: 0,
    updatedCount: 0,
    deletedCount: 0,
    triggeredCount: 0,
    dueCount: 0
  },
  upcomingReminders: [],
  overdueReminders: [],
  recentActivity: [],
  aiInsights: null
});
```

### TS-4: API Integration

**LLM Provider Options**:
1. OpenAI GPT-4 (Paid)
2. Anthropic Claude (Paid)
3. Groq (Free tier available)
4. Ollama (Local, Free)

**Recommended**: Start with Groq (free tier) or local Ollama for testing

---

## Implementation Steps

### Phase 1: Core Summary Dashboard (No LLM)

#### Step 1.1: Create Summary Component Structure

**File**: `src/components/SummaryDashboard.jsx`

```javascript
import { useState, useEffect } from 'react';
import './SummaryDashboard.css';

export const SummaryDashboard = ({ 
  notes, 
  deletedNotes, 
  onClose 
}) => {
  const [summaryData, setSummaryData] = useState(null);
  
  useEffect(() => {
    calculateSummary();
  }, [notes, deletedNotes]);
  
  const calculateSummary = () => {
    // Calculate statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Count created in last 7 days
    const createdCount = notes.filter(note => 
      new Date(note.createdAt) >= sevenDaysAgo
    ).length;
    
    // Count updated in last 7 days
    const updatedCount = notes.filter(note => 
      note.updatedAt && 
      new Date(note.updatedAt) >= sevenDaysAgo &&
      new Date(note.updatedAt) > new Date(note.createdAt)
    ).length;
    
    // Count deleted in last 7 days
    const deletedCount = deletedNotes.filter(note =>
      note.deletedAt && new Date(note.deletedAt) >= sevenDaysAgo
    ).length;
    
    // Find upcoming reminders (next 24 hours)
    const upcomingReminders = notes.filter(note =>
      !note.completed &&
      note.reminderTime &&
      new Date(note.reminderTime) >= now &&
      new Date(note.reminderTime) <= twentyFourHoursLater
    ).sort((a, b) => 
      new Date(a.reminderTime) - new Date(b.reminderTime)
    ).slice(0, 10);
    
    // Find overdue reminders
    const overdueReminders = notes.filter(note =>
      !note.completed &&
      note.reminderTime &&
      new Date(note.reminderTime) < now
    ).sort((a, b) => 
      new Date(a.reminderTime) - new Date(b.reminderTime)
    ).slice(0, 10);
    
    // Find recently triggered reminders
    const triggeredCount = notes.filter(note =>
      note.lastTriggered &&
      new Date(note.lastTriggered) >= twentyFourHoursAgo
    ).length;
    
    setSummaryData({
      stats: {
        createdCount,
        updatedCount,
        deletedCount,
        triggeredCount,
        dueCount: overdueReminders.length
      },
      upcomingReminders,
      overdueReminders
    });
  };
  
  if (!summaryData) return <div>Loading...</div>;
  
  return (
    <div className="summary-dashboard">
      <div className="summary-header">
        <button className="back-btn" onClick={onClose}>‹</button>
        <h2 className="summary-title">Summary & Analytics</h2>
        <button className="refresh-btn" onClick={calculateSummary}>
          ↻
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="summary-stats">
        <StatCard 
          icon="📝" 
          label="Created" 
          count={summaryData.stats.createdCount}
          subtitle="Last 7 days"
        />
        <StatCard 
          icon="✏️" 
          label="Updated" 
          count={summaryData.stats.updatedCount}
          subtitle="Last 7 days"
        />
        <StatCard 
          icon="🗑️" 
          label="Deleted" 
          count={summaryData.stats.deletedCount}
          subtitle="Last 7 days"
        />
        <StatCard 
          icon="⏰" 
          label="Triggered" 
          count={summaryData.stats.triggeredCount}
          subtitle="Last 24 hours"
        />
        <StatCard 
          icon="⚠️" 
          label="Overdue" 
          count={summaryData.stats.dueCount}
          subtitle="Past due"
          alert={summaryData.stats.dueCount > 0}
        />
      </div>
      
      {/* Upcoming Reminders */}
      {summaryData.upcomingReminders.length > 0 && (
        <ReminderSection 
          title="Upcoming Reminders (Next 24h)"
          reminders={summaryData.upcomingReminders}
          type="upcoming"
        />
      )}
      
      {/* Overdue Reminders */}
      {summaryData.overdueReminders.length > 0 && (
        <ReminderSection 
          title="Overdue Reminders"
          reminders={summaryData.overdueReminders}
          type="overdue"
        />
      )}
      
      {/* Empty State */}
      {summaryData.upcomingReminders.length === 0 && 
       summaryData.overdueReminders.length === 0 && (
        <div className="summary-empty">
          <p>🎉 You're all caught up!</p>
          <p className="summary-empty-subtitle">
            No upcoming or overdue reminders
          </p>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, count, subtitle, alert }) => (
  <div className={`stat-card ${alert ? 'stat-alert' : ''}`}>
    <span className="stat-icon">{icon}</span>
    <div className="stat-info">
      <div className="stat-count">{count}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  </div>
);

// Reminder Section Component
const ReminderSection = ({ title, reminders, type }) => (
  <div className="reminder-section">
    <h3 className="section-title">{title}</h3>
    <div className="reminder-list">
      {reminders.map(reminder => (
        <ReminderItem 
          key={reminder.id} 
          reminder={reminder} 
          type={type}
        />
      ))}
    </div>
  </div>
);

// Reminder Item Component
const ReminderItem = ({ reminder, type }) => {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    
    if (type === 'overdue') {
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)} days ago`;
    } else {
      if (hours < 1) return 'Within 1 hour';
      if (hours < 6) return `In ${hours} hours`;
      return 'Later today';
    }
  };
  
  return (
    <div className={`reminder-item reminder-${type}`}>
      <div className="reminder-content">
        <div className="reminder-title">{reminder.title}</div>
        <div className="reminder-time">
          {formatTime(reminder.reminderTime)}
        </div>
      </div>
      <div className="reminder-badge">
        {type === 'overdue' ? '⚠️' : '⏰'}
      </div>
    </div>
  );
};
```

#### Step 1.2: Create Summary Styles

**File**: `src/components/SummaryDashboard.css`

```css
.summary-dashboard {
  padding: 0;
  max-width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.summary-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.refresh-btn {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s, transform 0.3s;
}

.refresh-btn:hover {
  background: var(--border-color);
}

.refresh-btn:active {
  transform: rotate(180deg);
}

/* Stats Cards */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-alert {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-count {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Reminder Sections */
.reminder-section {
  padding: 0 1.5rem 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reminder-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: transform 0.2s;
}

.reminder-item:hover {
  transform: translateX(4px);
}

.reminder-overdue {
  border-left: 4px solid #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.reminder-upcoming {
  border-left: 4px solid #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.reminder-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.reminder-badge {
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* Empty State */
.summary-empty {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--text-secondary);
}

.summary-empty p {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.summary-empty-subtitle {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 480px) {
  .summary-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-count {
    font-size: 1.5rem;
  }
}
```

#### Step 1.3: Add Summary Button to Profile Page

**File**: `src/components/ProfilePage.jsx` (Add after Settings button)

```javascript
// Add state at top
const [showSummary, setShowSummary] = useState(false);

// Add before "Recently deleted" button
<button className="setting-item-nav" onClick={() => setShowSummary(true)}>
  <div className="nav-content">
    <span className="setting-label">Summary & Analytics</span>
    {dueCount > 0 && <span className="due-badge">{dueCount}</span>}
  </div>
  <span className="nav-arrow">›</span>
</button>

// Add at top of component (after FAQ check)
if (showSummary) {
  return <SummaryDashboard notes={notes} deletedNotes={deletedNotes} onClose={() => setShowSummary(false)} />;
}
```

**Add CSS** to `ProfilePage.css`:

```css
.due-badge {
  background: #f44336;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}
```

---

### Phase 2: Add Fake Data Generator

#### Step 2.1: Create Fake Data Utility

**File**: `src/utils/fakeDataGenerator.js`

```javascript
export const generateFakeData = () => {
  const now = new Date();
  
  const fakeNotes = [];
  const fakeDeleted = [];
  
  // Generate notes from last 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    
    // Random reminder (past, present, or future)
    const reminderOffset = Math.floor(Math.random() * 20) - 10; // -10 to +10 days
    const reminderDate = new Date(now.getTime() + reminderOffset * 24 * 60 * 60 * 1000);
    
    const note = {
      id: `fake-${i}-${Date.now()}`,
      title: getRandomTitle(),
      body: getRandomBody(),
      reminderTime: reminderDate.toISOString(),
      completed: Math.random() > 0.7,
      createdAt: createdDate.toISOString(),
      type: Math.random() > 0.5 ? 'note' : 'todo'
    };
    
    // 30% chance of being updated
    if (Math.random() > 0.7) {
      const updatedDate = new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      note.updatedAt = updatedDate.toISOString();
    }
    
    // 20% chance of being triggered
    if (reminderDate < now && Math.random() > 0.8) {
      note.lastTriggered = reminderDate.toISOString();
    }
    
    fakeNotes.push(note);
  }
  
  // Generate deleted notes (last 14 days)
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const deletedDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    
    fakeDeleted.push({
      id: `deleted-${i}-${Date.now()}`,
      title: getRandomTitle(),
      body: getRandomBody(),
      deletedAt: deletedDate.toISOString()
    });
  }
  
  return { fakeNotes, fakeDeleted };
};

const getRandomTitle = () => {
  const titles = [
    'Buy groceries',
    'Team meeting',
    'Doctor appointment',
    'Gym workout',
    'Call mom',
    'Pay bills',
    'Submit report',
    'Review code',
    'Plan vacation',
    'Read book',
    'Write blog post',
    'Fix bug #123',
    'Update documentation',
    'Client presentation',
    'Dentist checkup',
    'Car service',
    'Birthday party',
    'Project deadline',
    'Study session',
    'Coffee with Sarah'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const getRandomBody = () => {
  const bodies = [
    'Don\'t forget to check the details',
    'Important: needs attention today',
    'Follow up with team members',
    'Prepare materials in advance',
    'Review notes before meeting',
    'Bring necessary documents',
    'Set up reminder for follow-up',
    'Check calendar for conflicts',
    null, // Some notes have no body
    null
  ];
  return bodies[Math.floor(Math.random() * bodies.length)];
};
```

#### Step 2.2: Add Test Data Button

Add to Profile Page (in development mode):

```javascript
{process.env.NODE_ENV === 'development' && (
  <button 
    className="setting-item-nav" 
    onClick={handleGenerateFakeData}
  >
    <span className="setting-label">🧪 Generate Test Data</span>
    <span className="nav-arrow">›</span>
  </button>
)}
```

---

### Phase 3: LLM Integration

#### Step 3.1: Choose LLM Provider

**Option A: Groq (Recommended for testing)**
- Free tier: 30 requests/minute
- Fast response time
- No credit card required for testing

**Setup**:
1. Go to https://console.groq.com
2. Sign up and get API key
3. Install SDK: `npm install groq-sdk`

**Option B: Ollama (Local, Free)**
- Runs locally on your machine
- No API costs
- Privacy-friendly

**Setup**:
1. Install: https://ollama.ai/download
2. Run: `ollama run llama2`
3. Use local endpoint: http://localhost:11434

#### Step 3.2: Create LLM Service

**File**: `src/services/llmService.js`

```javascript
// Using Groq
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

export const generateSummaryInsights = async (summaryData) => {
  try {
    // Check cache first
    const cached = getCachedInsight();
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
      return cached.insight;
    }
    
    // Prepare prompt
    const prompt = `
You are a productivity assistant analyzing a user's note-taking activity.

Statistics (Last 7 days):
- Created: ${summaryData.stats.createdCount} notes/todos
- Updated: ${summaryData.stats.updatedCount} notes/todos
- Deleted: ${summaryData.stats.deletedCount} notes/todos
- Overdue: ${summaryData.stats.dueCount} reminders

Recent notes titles: ${summaryData.upcomingReminders.slice(0, 5).map(r => r.title).join(', ')}

Provide a brief, encouraging summary (2-3 sentences) about their productivity and one actionable tip. Keep it friendly and concise.
`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 150
    });
    
    const insight = response.choices[0]?.message?.content || "Keep up the great work!";
    
    // Cache result
    cacheInsight(insight);
    
    return insight;
  } catch (error) {
    console.error('LLM Error:', error);
    return getFallbackInsight(summaryData);
  }
};

// Fallback insights (if API fails)
const getFallbackInsight = (summaryData) => {
  const insights = [
    "You're staying productive! Keep organizing your tasks with reminders.",
    "Great job staying on top of your notes! Consider reviewing overdue items.",
    "Your note-taking habit is strong! Try batching similar tasks together.",
    "Nice work! Remember to break large tasks into smaller, manageable ones."
  ];
  return insights[Math.floor(Math.random() * insights.length)];
};

// Simple cache
let insightCache = null;

const cacheInsight = (insight) => {
  insightCache = {
    insight,
    timestamp: Date.now()
  };
  localStorage.setItem('llm_cache', JSON.stringify(insightCache));
};

const getCachedInsight = () => {
  if (insightCache) return insightCache;
  const cached = localStorage.getItem('llm_cache');
  return cached ? JSON.parse(cached) : null;
};
```

#### Step 3.3: Add AI Insights to Dashboard

In `SummaryDashboard.jsx`, add:

```javascript
import { generateSummaryInsights } from '../services/llmService';

// Add state
const [aiInsights, setAiInsights] = useState(null);
const [loadingInsights, setLoadingInsights] = useState(false);

// Add useEffect
useEffect(() => {
  if (summaryData) {
    loadAIInsights();
  }
}, [summaryData]);

const loadAIInsights = async () => {
  setLoadingInsights(true);
  try {
    const insights = await generateSummaryInsights(summaryData);
    setAiInsights(insights);
  } catch (error) {
    console.error('Failed to load insights:', error);
  } finally {
    setLoadingInsights(false);
  }
};

// Add to JSX (after stats cards)
{aiInsights && (
  <div className="ai-insights">
    <h3 className="insights-title">🤖 AI Insights</h3>
    <div className="insights-content">
      {loadingInsights ? (
        <div className="insights-loading">Generating insights...</div>
      ) : (
        <p className="insights-text">{aiInsights}</p>
      )}
    </div>
  </div>
)}
```

**Add CSS**:

```css
.ai-insights {
  margin: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.insights-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.insights-content {
  font-size: 0.95rem;
  line-height: 1.6;
}

.insights-loading {
  opacity: 0.8;
  font-style: italic;
}
```

---

## Testing Strategy

### Unit Tests

```javascript
// Test summary calculations
describe('Summary Calculations', () => {
  test('counts created notes in last 7 days', () => {
    const notes = [
      { createdAt: '2026-04-19T10:00:00Z' }, // 1 day ago
      { createdAt: '2026-04-10T10:00:00Z' }  // 10 days ago
    ];
    expect(countCreated(notes)).toBe(1);
  });
  
  test('identifies overdue reminders', () => {
    const notes = [
      { reminderTime: '2026-04-19T10:00:00Z', completed: false },
      { reminderTime: '2026-04-21T10:00:00Z', completed: false }
    ];
    expect(getOverdue(notes)).toHaveLength(1);
  });
});
```

### Integration Tests

```javascript
// Test LLM service
describe('LLM Service', () => {
  test('generates insights from summary data', async () => {
    const data = { stats: { createdCount: 5 } };
    const insights = await generateSummaryInsights(data);
    expect(insights).toBeTruthy();
    expect(typeof insights).toBe('string');
  });
  
  test('uses fallback on API error', async () => {
    // Mock API failure
    const insights = await generateSummaryInsights({});
    expect(insights).toContain('productive');
  });
});
```

### Manual Tests

Use the test cases from TEST_CASES.md and add:
- TC_SUMMARY_001: View summary with real data
- TC_SUMMARY_002: View summary with fake data
- TC_SUMMARY_003: AI insights generation
- TC_SUMMARY_004: Cache functionality

---

## Environment Variables

Create `.env` file:

```env
# Groq API (get from https://console.groq.com)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Or Ollama (local)
VITE_LLM_ENDPOINT=http://localhost:11434

# Feature flags
VITE_ENABLE_LLM=true
VITE_ENABLE_FAKE_DATA=true
```

---

## Data Models

### Extended Note Model

```typescript
interface Note {
  id: string;
  title: string;
  body?: string;
  reminderTime: string; // ISO 8601
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  lastTriggered?: string; // ISO 8601
  type: 'note' | 'todo';
}

interface DeletedNote extends Note {
  deletedAt: string; // ISO 8601
}

interface SummaryData {
  stats: {
    createdCount: number;
    updatedCount: number;
    deletedCount: number;
    triggeredCount: number;
    dueCount: number;
  };
  upcomingReminders: Note[];
  overdueReminders: Note[];
  recentActivity: ActivityItem[];
  aiInsights: string | null;
}

interface ActivityItem {
  type: 'created' | 'updated' | 'deleted' | 'triggered';
  note: Note;
  timestamp: string;
}
```

---

## Success Criteria

### Must Have
- ✅ Display summary statistics correctly
- ✅ Show upcoming and overdue reminders
- ✅ Summary button accessible from Profile
- ✅ Responsive design (mobile + desktop)
- ✅ Fake data generator for testing

### Should Have
- ✅ LLM-generated insights
- ✅ Cache AI responses
- ✅ Graceful error handling
- ✅ Loading states

### Nice to Have
- 📊 Charts/graphs for trends
- 📤 Export summary as PDF
- 🔔 Weekly summary email
- 🎯 Goal tracking

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Core dashboard (no LLM) | 4-6 hours |
| Phase 2 | Fake data generator | 1-2 hours |
| Phase 3 | LLM integration | 3-4 hours |
| Testing | All tests | 2-3 hours |
| **Total** | | **10-15 hours** |

---

## Dependencies

```json
{
  "dependencies": {
    "groq-sdk": "^0.3.2"
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Dashboard
- [ ] Create SummaryDashboard.jsx component
- [ ] Create SummaryDashboard.css styles
- [ ] Add summary button to ProfilePage
- [ ] Implement statistics calculation
- [ ] Implement upcoming reminders list
- [ ] Implement overdue reminders list
- [ ] Add empty states
- [ ] Test on mobile and desktop

### Phase 2: Fake Data
- [ ] Create fakeDataGenerator.js utility
- [ ] Add test data button (dev mode only)
- [ ] Generate varied test scenarios
- [ ] Test with fake data

### Phase 3: LLM
- [ ] Sign up for Groq (or install Ollama)
- [ ] Create llmService.js
- [ ] Implement insight generation
- [ ] Implement caching
- [ ] Add fallback insights
- [ ] Add AI section to dashboard
- [ ] Test API integration

### Phase 4: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add animations
- [ ] Add refresh button
- [ ] Test all edge cases
- [ ] Update documentation

---

## Next Steps

1. **Start with Phase 1** (Core Dashboard without LLM)
2. **Test thoroughly** with real data
3. **Add fake data** for testing edge cases
4. **Integrate LLM** (Phase 3)
5. **Polish and optimize**

Would you like me to start implementing any specific phase?

---

**Document Status**: Ready for Implementation  
**Last Updated**: April 20, 2026  
**Author**: Development Team
