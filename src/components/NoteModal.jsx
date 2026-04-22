import { useState, useEffect, useRef } from 'react';
import { Calendar } from 'react-calendar-datetime';
import './NoteModal.css';

export const NoteModal = ({ isOpen, onClose, onSave, note, onDelete }) => {
  const [title, setTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const bodyRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setReminderTime(note.reminderTime);
      if (bodyRef.current) {
        bodyRef.current.innerHTML = note.body || '';
      }
    } else {
      setTitle('');
      setReminderTime('');
      if (bodyRef.current) {
        bodyRef.current.innerHTML = '';
      }
    }
  }, [note, isOpen]);

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  const execFormat = (command) => {
    bodyRef.current.focus();
    document.execCommand(command, false, null);
    updateActiveFormats();
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      bodyRef.current.focus();
      document.execCommand('insertHTML', false, `<img src="${ev.target.result}" class="note-inline-image" alt="image" />`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a note title');
      return;
    }
    if (!reminderTime) {
      alert('Please select a reminder time');
      return;
    }
    const bodyHTML = bodyRef.current ? bodyRef.current.innerHTML : '';
    onSave(title.trim(), bodyHTML, reminderTime);
    setTitle('');
    setReminderTime('');
    if (bodyRef.current) bodyRef.current.innerHTML = '';
  };

  const handleDelete = async () => {
    await onDelete(note.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="note-editor">
        <div className="editor-header">
          <button className="editor-back" onClick={onClose}>←</button>
          <div className="editor-actions">
            {note && (
              <button className="editor-delete" onClick={handleDelete} title="Delete">🗑️</button>
            )}
            <button className="editor-action" title="Undo" onClick={() => { bodyRef.current.focus(); document.execCommand('undo'); }}>↶</button>
            <button className="editor-action" title="Redo" onClick={() => { bodyRef.current.focus(); document.execCommand('redo'); }}>↷</button>
            <button className="editor-save" onClick={handleSave} title="Save">✓</button>
          </div>
        </div>

        <div className="editor-content">
          <div className="editor-title-section">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="editor-title-input"
              autoFocus
            />

            {/* Rich text body */}
            <div
              ref={bodyRef}
              className="editor-body-rich"
              contentEditable
              suppressContentEditableWarning
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              data-placeholder="Add note body..."
            />

            {/* Formatting toolbar (shown when Aa is clicked) */}
            {showFormatting && (
              <div className="format-toolbar">
                <button
                  className={`fmt-btn ${activeFormats.bold ? 'fmt-active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }}
                  title="Bold"
                >
                  <b>B</b>
                </button>
                <button
                  className={`fmt-btn ${activeFormats.italic ? 'fmt-active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }}
                  title="Italic"
                >
                  <i>I</i>
                </button>
                <button
                  className={`fmt-btn ${activeFormats.underline ? 'fmt-active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="fmt-divider" />
                <button
                  className="fmt-btn"
                  onMouseDown={(e) => { e.preventDefault(); execFormat('insertUnorderedList'); }}
                  title="Bullet list"
                >
                  ☰
                </button>
                <button
                  className="fmt-btn"
                  onMouseDown={(e) => { e.preventDefault(); execFormat('insertOrderedList'); }}
                  title="Numbered list"
                >
                  ≡
                </button>
                <div className="fmt-divider" />
                <button
                  className="fmt-btn"
                  onMouseDown={(e) => { e.preventDefault(); execFormat('removeFormat'); }}
                  title="Clear formatting"
                >
                  T̶
                </button>
              </div>
            )}

            <div className="editor-meta">
              <span className="meta-text">{title.length} characters</span>
              <button
                type="button"
                className="set-reminder-btn"
                onClick={() => setShowCalendar((v) => !v)}
              >
                🕐 {reminderTime
                  ? new Date(reminderTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                  : 'Set Reminder'}
              </button>
            </div>

            {/* Hidden test input — only in emulator mode, lets Playwright set reminder directly */}
            {import.meta.env.VITE_USE_EMULATOR === 'true' && (
              <input
                type="datetime-local"
                data-testid="test-reminder-input"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
                onChange={(e) => {
                  if (e.target.value) setReminderTime(new Date(e.target.value).toISOString());
                }}
              />
            )}

            {showCalendar && (
              <div className="editor-calendar-section">
                <Calendar
                  value={reminderTime ? new Date(reminderTime) : new Date()}
                  onChange={(date) => {
                    if (date) {
                      setReminderTime(date.toISOString());
                      setShowCalendar(false);
                    }
                  }}
                  locale="en"
                  theme="paper"
                  time={true}
                  hour12={true}
                  width="100%"
                  startDate={new Date()}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="editor-toolbar">
          <button
            className={`toolbar-btn ${showFormatting ? 'toolbar-btn-active' : ''}`}
            title="Text Style"
            onClick={() => setShowFormatting((v) => !v)}
          >
            <span className="toolbar-icon">Aa</span>
          </button>
          <button
            className="toolbar-btn"
            title="Insert Image"
            onClick={() => imageInputRef.current.click()}
          >
            <span className="toolbar-icon">🖼</span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImagePick}
          />
          <button className="toolbar-btn" title="Reminder" onClick={() => setShowCalendar((v) => !v)}>
            <span className="toolbar-icon">⏰</span>
          </button>
        </div>
      </div>
    </>
  );
};
