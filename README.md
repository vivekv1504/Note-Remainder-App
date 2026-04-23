# Reminder Note App

A modern, feature-rich note-taking application with reminder functionality and **AI-powered summary insights** built with React, Vite, and Azure OpenAI.

## Features Implemented

### Core Note Management
- **Create Notes**: Add new notes with title and body content
- **Edit Notes**: Modify existing notes with full editing capabilities
- **Delete Notes**: Remove notes with confirmation
- **Mark Complete**: Toggle notes as complete/incomplete with checkbox
- **Character Count**: Real-time character counter for note titles

### Rich Text Editing
- **Bold Text**: Apply bold formatting to selected text
- **Italic Text**: Apply italic formatting to selected text
- **Underline Text**: Apply underline formatting to selected text
- **Bullet Lists**: Create unordered lists
- **Numbered Lists**: Create ordered lists
- **Clear Formatting**: Remove all formatting from selected text
- **Undo/Redo**: Navigate through edit history
- **Image Support**: Insert images directly into note body
  - Image file picker with preview
  - Images stored as base64 inline
  - Responsive image display with rounded corners

### Reminder System
- **Date & Time Picker**: Interactive calendar with time selection
  - 12-hour format with AM/PM selector
  - Prevents selection of past dates
  - Inline calendar display (no fullscreen overlay)
  - Visual date/time display in readable format
- **Set Reminder Button**: Easy access to reminder settings
  - Shows "Set Reminder" when no time is set
  - Shows formatted date/time when reminder is active
  - Toggle calendar visibility with single click

### User Interface
- **Modern Design**: Clean, minimalist interface
- **Responsive Layout**: Works on desktop and mobile devices
- **Theme Support**: CSS variable-based theming (light/dark mode ready)
- **Smooth Animations**:
  - Slide-in transitions for modals
  - Fade-in effects for calendar and formatting toolbar
  - Hover effects on buttons
- **Multiple View Modes**:
  - Full editor modal for detailed note editing
  - Quick todo mode for fast note entry
  - List view for note management

### AI Summary & Analytics (NEW! 🚀)
- **AI-Powered Insights**: Get intelligent summaries of your productivity using Azure OpenAI GPT-4o
- **Weekly Analytics**: Comprehensive analysis of last 7 days activity
- **Smart Metrics**:
  - Notes created, updated, and deleted
  - Todo completion rate and pending tasks
  - Reminder status (triggered, due, overdue)
  - Productivity score (0-100)
  - Activity streak tracking
- **Productivity Patterns**:
  - Most active day of the week
  - Most productive time of day
  - Average notes per day
- **Personalized Recommendations**: AI-generated actionable suggestions
- **Real-time Generation**: Live AI summaries powered by LiteLLM + Webex LLM Proxy
- **Fallback Support**: Local template-based summaries when backend is unavailable
- **Visual Indicators**: "🚀 Live AI" badge shows when using Azure OpenAI

### Quick Todo Mode
- **Fast Entry**: Streamlined interface for rapid note creation
- **Keyboard Support**: Press Enter to create another note instantly
- **Minimal UI**: Focus on quick task entry
- **Calendar Integration**: Same reminder functionality as full editor

### Note Display
- **Rich Preview**: Shows formatted content in note list
- **Reminder Display**: Visual indicator with formatted date/time
- **Completion Status**: Visual distinction for completed notes
- **Edit Mode**: Inline editing with calendar picker
- **Action Buttons**: Quick access to edit and delete functions

### Technical Features
- **Component-Based Architecture**: Modular React components
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Date Library**: `react-calendar-datetime` (v5.1.3)
  - Zero external dependencies
  - Built-in styles
  - Full date and time selection
- **Content Editable**: Native browser rich text editing
- **File Handling**: Image upload and embedding

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Date Picker**: react-calendar-datetime (v5.1.3)
- **Styling**: CSS with CSS Variables
- **Rich Text**: Native `contentEditable` with `document.execCommand`
- **State Management**: Firebase Firestore
- **Authentication**: Firebase Auth

### Backend (AI Summary)
- **Framework**: Flask 3.0.0
- **LLM Integration**: LiteLLM 1.83.0+
- **AI Provider**: Azure OpenAI (GPT-4o)
- **Authentication**: Webex Bearer Token
- **Proxy**: Cisco Webex LLM Proxy
- **CORS**: Flask-CORS 4.0.0

## Project Structure

```
Remainder-note-app/
├── src/
│   ├── components/
│   │   ├── NoteModal.jsx       # Main note editor with rich text
│   │   ├── NoteModal.css       # Editor styling
│   │   ├── NoteItem.jsx        # Individual note display/edit
│   │   ├── NoteItem.css        # Note item styling
│   │   ├── NoteForm.jsx        # Note creation form
│   │   ├── NoteForm.css        # Form styling
│   │   ├── QuickTodo.jsx       # Quick todo entry modal
│   │   ├── QuickTodo.css       # Quick todo styling
│   │   ├── SummaryView.jsx     # AI Summary dashboard
│   │   └── SummaryView.css     # Summary styling
│   └── services/
│       ├── llmService.js       # LiteLLM backend API client
│       └── summaryService.js   # Data aggregation & analytics
├── backend/
│   ├── src/
│   │   ├── server.py           # Flask API server
│   │   └── llm_service.py      # LiteLLM integration
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Backend configuration (SECRET)
│   ├── .env.example           # Configuration template
│   └── README.md              # Backend documentation
├── .env                       # Frontend configuration (SECRET)
├── .env.example              # Configuration template
└── AI_SUMMARY_SETUP.md       # AI feature setup guide
```

## Key Features by Component

### NoteModal
- Full-screen note editor
- Rich text formatting toolbar (toggleable with "Aa" button)
- Image insertion with file picker
- Calendar picker for reminders
- Undo/Redo functionality
- Save/Delete actions
- Character count display
- Set Reminder button inline with character count

### NoteItem
- Note preview with formatted content
- Checkbox for completion status
- Reminder time display with clock icon
- Edit button (opens inline editor)
- Delete button with confirmation
- Inline editing mode with calendar

### NoteForm
- Simple note creation form
- Title input field
- Calendar picker for reminder
- Validation for required fields
- Submit button

### QuickTodo
- Overlay modal for quick entry
- Single input field with circle checkbox icon
- Bell icon for reminder settings
- Press Enter for rapid creation (stays open for multiple entries)
- "Done" button to close
- Edit mode for existing todos
- Delete functionality

### SummaryView (AI Analytics Dashboard)
- Weekly activity overview (last 7 days)
- AI-generated insights using Azure OpenAI GPT-4o
- Metrics grid with visual cards:
  - Notes created/updated/deleted
  - Todos completed/pending
  - Reminders triggered/due/overdue
  - Productivity score
  - Activity streak
- Overdue reminders alert section
- Upcoming reminders list
- Activity breakdown statistics
- Productivity patterns insights
- Refresh button for regenerating summaries
- Visual indicator for AI vs fallback mode

## Installation & Setup

### Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your Firebase configuration

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Backend Setup (AI Summary Feature)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your Webex Bearer Token

# Start backend server
python src/server.py
```

Backend will be available at: **http://localhost:5001**

#### Getting Webex Bearer Token

1. Go to: https://developer-portal-intb.ciscospark.com
2. Login with your Cisco credentials
3. Copy the bearer token from the Authorization field
4. Paste it in `backend/.env`:
   ```env
   WEBEX_BEARER_TOKEN=your_token_here
   ```

📖 **For detailed AI setup instructions**, see: [AI_SUMMARY_SETUP.md](AI_SUMMARY_SETUP.md)

## Development Workflow

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python src/server.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Open browser:** http://localhost:5173

## Build for Production

```bash
npm run build
```

## Features Breakdown

### Formatting Toolbar
The formatting toolbar appears when you click the "Aa" button in the bottom toolbar:
- **B** - Bold
- **I** - Italic
- **U** - Underline
- **☰** - Bullet list
- **≡** - Numbered list
- **T̶** - Clear formatting

### Calendar Features
- Start date set to current date (prevents past dates)
- 12-hour time format with AM/PM selector
- Inline display in editor
- Paper theme for clean appearance
- Full width display
- Automatically closes after date selection

### Bottom Toolbar
- **Aa** - Toggle text formatting options
- **🖼** - Insert image from device

## API Endpoints (Backend)

### Health Check
```
GET /health
```
Returns backend status and configuration.

### Test LiteLLM Connection
```
GET /api/test-connection
```
Verifies connection to Azure OpenAI via Webex LLM Proxy.

### Generate AI Summary
```
POST /api/generate-summary
Content-Type: application/json

{
  "notes": { "created": [...], "updated": [...], "deleted": [...] },
  "todos": { "completed": [...], "pending": 0 },
  "reminders": { "triggered": [...], "due": [...], "overdue": [...] }
}
```
Returns AI-generated summary with insights.

### Check Token Status
```
GET /api/token-status
```
Returns bearer token configuration status.

## Data Persistence
- Notes are stored with:
  - Unique ID
  - Title
  - Body (HTML content for rich text)
  - Reminder time (ISO string format)
  - Completion status
  - Created/Updated timestamps
- Backend stores:
  - Bearer token configuration
  - LLM endpoint settings
  - CORS allowed origins

## Environment Variables

### Frontend (.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5001
```

### Backend (.env)
```env
# Webex Bearer Token (from developer-portal-intb.ciscospark.com)
WEBEX_BEARER_TOKEN=your_bearer_token_here

# Azure OpenAI Configuration via Webex LLM Proxy
AZURE_OPENAI_ENDPOINT=https://llm-proxy.us-east-2.int.infra.intelligence.webex.com/azure/v1
AZURE_API_VERSION=2024-10-21
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Flask Server Configuration
FLASK_ENV=development
FLASK_PORT=5001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5176
```

## Browser Compatibility

- Modern browsers supporting ES6+
- `contentEditable` API
- `FileReader` API for images
- CSS Grid and Flexbox
- `document.execCommand` for rich text editing
- Fetch API for backend communication

## Testing

### Backend Tests
```bash
# Test health endpoint
curl http://localhost:5001/health

# Test LiteLLM connection
curl http://localhost:5001/api/test-connection

# Test AI summary generation
curl -X POST http://localhost:5001/api/generate-summary \
  -H "Content-Type: application/json" \
  -d '{"notes":{"created":[{"title":"Test"}],"updated":[],"deleted":[]},"todos":{"completed":[],"pending":0},"reminders":{"triggered":[],"due":[],"overdue":[]}}'
```

### Frontend Tests
Open browser console (F12) and run:
```javascript
fetch('http://localhost:5001/api/test-connection')
  .then(r => r.json())
  .then(d => console.log('Backend Status:', d))
```

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -ti:5001

# Kill the process
lsof -ti:5001 | xargs kill -9
```

### 403 Unauthorized Error
- Token expired - get a new one from https://developer-portal-intb.ciscospark.com
- Update `backend/.env` with new token
- Restart backend server

### AI Summary shows "Local Fallback"
- Backend not running - check `curl http://localhost:5001/health`
- Check browser console (F12) for errors
- Verify `VITE_BACKEND_URL` in frontend `.env`
- Restart frontend: `Ctrl+C` then `npm run dev`

## Key Features Summary

✅ Rich text note editing with formatting  
✅ Todo list management with completion tracking  
✅ Reminder system with date/time picker  
✅ Image insertion and embedding  
✅ Quick todo entry mode  
✅ **AI-powered weekly summaries (Azure OpenAI GPT-4o)**  
✅ **Productivity analytics and insights**  
✅ **Smart recommendations and patterns**  
✅ Firebase authentication and data persistence  
✅ Responsive design for all devices  
✅ Real-time updates  

## Documentation

- **Main README**: This file
- **Backend Documentation**: [backend/README.md](backend/README.md)
- **AI Setup Guide**: [AI_SUMMARY_SETUP.md](AI_SUMMARY_SETUP.md)
- **Frontend Config**: [.env.example](.env.example)
- **Backend Config**: [backend/.env.example](backend/.env.example)

## Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 5173)
│  Vite + React   │
└────────┬────────┘
         │
         ├─────────────► Firebase (Auth + Firestore)
         │
         └─────────────► Flask Backend (Port 5001)
                         │
                         └─► LiteLLM
                             │
                             └─► Webex LLM Proxy
                                 │
                                 └─► Azure OpenAI (GPT-4o)
```

## Future Enhancement Ideas

- Categories/Tags for notes
- Search functionality
- Filter by completion status
- Sort notes (by date, title, etc.)
- Export notes (PDF, Markdown, etc.)
- Notification system for reminders
- Recurring reminders
- Note sharing
- More attachments support
- Voice notes
- Markdown support
- Collaboration features
- Dark/Light theme toggle
- Mobile app (React Native)
- Browser extension
- AI-powered note suggestions
- Sentiment analysis
- Auto-categorization

---

## License

Internal project - not for public distribution.

---

Built with ❤️ using React + Vite + Azure OpenAI

**Contributor**: VIVEKANANDA
**Version**: 2.0.0 (with AI Summary feature)
