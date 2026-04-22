# Reminder Note App

A modern, feature-rich note-taking application with reminder functionality built with React and Vite.

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

- **Framework**: React 18
- **Build Tool**: Vite
- **Date Picker**: react-calendar-datetime (v5.1.3)
- **Styling**: CSS with CSS Variables
- **Rich Text**: Native `contentEditable` with `document.execCommand`

## Components Structure

```
src/
├── components/
│   ├── NoteModal.jsx       # Main note editor with rich text
│   ├── NoteModal.css       # Editor styling
│   ├── NoteItem.jsx        # Individual note display/edit
│   ├── NoteItem.css        # Note item styling
│   ├── NoteForm.jsx        # Note creation form
│   ├── NoteForm.css        # Form styling
│   ├── QuickTodo.jsx       # Quick todo entry modal
│   └── QuickTodo.css       # Quick todo styling
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

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

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

## Data Persistence
- Notes are stored with:
  - Unique ID
  - Title
  - Body (HTML content for rich text)
  - Reminder time (ISO string format)
  - Completion status

## Browser Compatibility

- Modern browsers supporting ES6+
- `contentEditable` API
- `FileReader` API for images
- CSS Grid and Flexbox
- `document.execCommand` for rich text editing

## Future Enhancement Ideas

- Categories/Tags for notes
- Search functionality
- Filter by completion status
- Sort notes (by date, title, etc.)
- Export notes (PDF, Markdown, etc.)
- Cloud sync
- Notification system for reminders
- Recurring reminders
- Note sharing
- More attachments support
- Voice notes
- Markdown support
- Collaboration features
- Dark/Light theme toggle

---

Built with ❤️ using React + Vite
