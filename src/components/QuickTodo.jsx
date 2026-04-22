import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'react-calendar-datetime';
import './QuickTodo.css';

export const QuickTodo = ({ isOpen, onClose, onSave, onUpdate, onDelete, note }) => {
  const [todoText, setTodoText] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTodoText(note.title);
        setReminderTime(note.reminderTime);
      } else {
        setTodoText('');
        setReminderTime('');
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, note]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && todoText.trim()) {
      if (note) {
        // Editing mode - update and close
        onUpdate(note.id, { title: todoText.trim(), reminderTime });
        onClose();
      } else {
        // Adding mode - save and continue
        onSave(todoText.trim(), reminderTime);
        setTodoText('');
        setReminderTime('');
      }
    }
  };

  const handleDone = () => {
    if (note) {
      // Editing mode
      if (todoText.trim()) {
        onUpdate(note.id, { title: todoText.trim(), reminderTime });
      }
    } else {
      // Adding mode
      if (todoText.trim()) {
        onSave(todoText.trim(), reminderTime);
      }
    }
    setTodoText('');
    onClose();
  };

  const handleDelete = () => {
    if (note && window.confirm('Delete this to-do?')) {
      onDelete(note.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const formatReminderTime = () => {
    if (!reminderTime) return 'Set reminder';
    const date = new Date(reminderTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="quick-todo-overlay">
      <div className="quick-todo-container">
        <h1 className="quick-todo-header">{note ? 'Edit' : 'New'}</h1>

        <div className="quick-todo-input-wrapper">
          <div className="todo-checkbox-icon">○</div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter to-do"
            value={todoText}
            onChange={(e) => setTodoText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="quick-todo-input"
          />
        </div>

        {!note && <p className="quick-todo-hint">Press Enter to create another</p>}

        {/* Hidden test input — only in emulator mode */}
        {import.meta.env.VITE_USE_EMULATOR === 'true' && (
          <input
            type="datetime-local"
            data-testid="test-todo-reminder-input"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
            onChange={(e) => {
              if (e.target.value) setReminderTime(new Date(e.target.value).toISOString());
            }}
          />
        )}

        {showDatePicker && (
          <div className="quick-todo-datepicker">
            <h4 className="datepicker-title">Set Reminder Time</h4>
            <Calendar
              value={reminderTime ? new Date(reminderTime) : new Date()}
              onChange={(date) => {
                if (date) {
                  setReminderTime(date.toISOString());
                  setShowDatePicker(false);
                }
              }}
              locale="en"
              theme="paper"
              time={true}
              hour12={true}
              width="100%"
              startDate={new Date()}
            />
            <button
              className="close-picker-btn"
              onClick={() => setShowDatePicker(false)}
            >
              Done
            </button>
          </div>
        )}

        <div className="quick-todo-footer">
          {note && (
            <button className="footer-icon-btn delete-icon" onClick={handleDelete} title="Delete">
              🗑️
            </button>
          )}
          <button
            className="footer-icon-btn reminder-btn"
            onClick={() => setShowDatePicker(!showDatePicker)}
            title={formatReminderTime()}
          >
            🔔
          </button>
          <button className="done-btn" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
