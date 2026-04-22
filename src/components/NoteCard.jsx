import { useState } from 'react';
import './NoteCard.css';

export const NoteCard = ({ note, onToggleComplete, onDelete, onUpdate, onClick }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  const handleToggleComplete = (e) => {
    e.stopPropagation();
    onToggleComplete(note.id);
  };

  return (
    <div
      className={`note-card ${note.completed ? 'completed' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="note-card-content" onClick={onClick}>
        <h3 className="note-card-title">{note.title}</h3>
        <div className="note-card-footer">
          <span className="note-card-time">{formatDateTime(note.reminderTime)}</span>
          {note.completed && <span className="note-card-lock">✓</span>}
        </div>
      </div>

      <div className={`note-card-actions ${showActions ? 'visible' : ''}`}>
        <button
          className="card-action-btn"
          onClick={handleToggleComplete}
          title={note.completed ? 'Mark as pending' : 'Mark as complete'}
        >
          {note.completed ? '↶' : '✓'}
        </button>
        <button
          className="card-action-btn delete-btn"
          onClick={handleDelete}
          title="Delete note"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
