import { useState, useRef } from 'react';
import { useCustomRingtones } from '../hooks/useCustomRingtones';
import { SummaryView } from './SummaryView';
import './ProfilePage.css';

const BUILTIN_RINGTONE_BASE = import.meta.env.BASE_URL;
const DEFAULT_RINGTONE = `${BUILTIN_RINGTONE_BASE}ringtone.wav`;

export const ProfilePage = ({ user, notes, deletedNotes = [], onRestoreNote, onPermanentlyDeleteNote, theme, onToggleTheme, notificationsEnabled, onToggleNotifications, selectedRingtone, onRingtoneChange, onSignOut }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Load custom ringtones from Firestore with real-time sync
  const { customRingtones, loading: ringtoneLoading, error: ringtoneError, addRingtone, deleteRingtone } = useCustomRingtones(user?.uid);
  
  const fileInputRef = useRef(null);
  const previewAudioRef = useRef(null);
  const [playingPath, setPlayingPath] = useState(null);
  const [uploadingRingtone, setUploadingRingtone] = useState(false);
  const [deletingRingtoneId, setDeletingRingtoneId] = useState(null);

  const BUILTIN_RINGTONES = [
    { label: 'Classic', path: DEFAULT_RINGTONE, icon: '🔔' },
    { label: 'Sinder', path: `${BUILTIN_RINGTONE_BASE}sinder.mp3`, icon: '🎵' },
  ];

  const allRingtones = [...BUILTIN_RINGTONES, ...customRingtones];

  const previewRingtone = (path) => {
    console.log('[Preview] path:', typeof path, '|', path?.slice(0, 60));
    if (!path) { console.error('[Preview] path is empty'); return; }
    // If the same one is playing, pause it
    if (previewAudioRef.current && playingPath === path) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
      setPlayingPath(null);
      return;
    }
    // Stop any currently playing audio
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }
    const audio = new Audio(path);
    audio.volume = 1.0;
    // Resume AudioContext if suspended (required by Chrome autoplay policy)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          previewAudioRef.current = audio;
          setPlayingPath(path);
        })
        .catch((err) => {
          console.error('[Preview] Audio play failed:', err.name, err.message, '| path was:', path?.slice(0, 80));
          // Try resuming AudioContext and retry once
          const ctx = new AudioContext();
          ctx.resume().then(() => {
            audio.play()
              .then(() => {
                previewAudioRef.current = audio;
                setPlayingPath(path);
              })
              .catch((e) => console.error('[Preview] Retry failed:', e.message));
          });
        });
    }
    audio.onended = () => { setPlayingPath(null); previewAudioRef.current = null; };
  };

  const handleAddRingtone = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    const name = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();

    setUploadingRingtone(true);

    reader.onload = async (event) => {
      const dataUrl = event.target.result;

      // Add to Firestore via the hook
      const docId = await addRingtone(name, dataUrl);

      if (docId) {
        onRingtoneChange(dataUrl);
        console.log('[Ringtone] Successfully uploaded to Firestore:', docId);
      } else {
        console.error('[Ringtone] Failed to upload');
      }

      setUploadingRingtone(false);
    };

    reader.onerror = () => {
      console.error('[Ringtone] File read error');
      setUploadingRingtone(false);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteCustomRingtone = async (ringtoneId) => {
    if (!user?.uid) return;

    setDeletingRingtoneId(ringtoneId);

    const success = await deleteRingtone(ringtoneId);

    if (success) {
      // If deleted ringtone was selected, revert to default
      const ringtone = customRingtones.find((r) => r.id === ringtoneId);
      if (ringtone && selectedRingtone === ringtone.path) {
        onRingtoneChange(DEFAULT_RINGTONE);
      }
      console.log('[Ringtone] Successfully deleted from Firestore');
    } else {
      console.error('[Ringtone] Failed to delete');
    }

    setDeletingRingtoneId(null);
  };

  // Calculate counts
  const notesCount = notes.filter(note => !note.type || note.type === 'note').length;
  const todosCount = notes.filter(note => note.type === 'todo' && !note.completed).length;
  const deletedCount = deletedNotes.length;

  // Summary view
  if (showSummary) {
    return (
      <SummaryView
        notes={notes}
        deletedNotes={deletedNotes}
        onBack={() => setShowSummary(false)}
      />
    );
  }

  // FAQ view
  if (showFAQ) {
    return (
      <div className="profile-page">
        <div className="settings-header">
          <button className="back-btn" onClick={() => setShowFAQ(false)}>‹</button>
          <h2 className="settings-title">FAQ & Help</h2>
        </div>
        <div className="faq-content">
          <div className="faq-item">
            <h4 className="faq-question">❓ How do I create a note?</h4>
            <p className="faq-answer">
              Click the "+" button at the bottom right or use the Quick Todo option. Enter your title, add content, and set a reminder time.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">⏰ How do I set a reminder?</h4>
            <p className="faq-answer">
              Click the "Set Reminder" button when creating or editing a note. Select a date and time from the calendar. You cannot select past dates.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">✏️ How do I format text?</h4>
            <p className="faq-answer">
              Open the note editor and click the "Aa" button at the bottom to show the formatting toolbar. You can make text bold, italic, underlined, or create lists.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">🖼️ How do I add images?</h4>
            <p className="faq-answer">
              Click the image icon (🖼️) in the bottom toolbar when editing a note. Select an image from your device to insert it into your note.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">🔔 How do notifications work?</h4>
            <p className="faq-answer">
              Enable notifications in Settings. When a reminder time arrives, you'll receive a notification and hear the selected ringtone. Reminders repeat every 5 minutes until dismissed.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">🎵 Can I change the reminder sound?</h4>
            <p className="faq-answer">
              Yes! Go to Settings → Reminder Ringtone. Choose from built-in sounds or upload your own custom ringtone by clicking "+ Add Ringtone".
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">🗑️ How do I recover deleted notes?</h4>
            <p className="faq-answer">
              Go to Profile → Recently Deleted. You can restore notes or permanently delete them. Deleted notes are kept for recovery until permanently removed.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">✅ What's the difference between notes and todos?</h4>
            <p className="faq-answer">
              Todos are quick tasks with checkboxes. Notes can have rich formatting, images, and detailed content. Both support reminders.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">🌙 How do I switch between light and dark mode?</h4>
            <p className="faq-answer">
              Go to Settings and toggle the Theme switch. Your preference is saved automatically.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">💾 Are my notes saved automatically?</h4>
            <p className="faq-answer">
              Yes! Notes are saved automatically when you click the save button (✓) or press Done. Your data is stored securely in your browser.
            </p>
          </div>

          <div className="faq-separator"></div>

          <div className="faq-contact-section">
            <h4 className="faq-contact-title">📧 Still need help?</h4>
            <p className="faq-contact-text">
              If you have questions, feedback, or encountered an issue that's not covered here, feel free to contact us.
            </p>
            <a
              href="mailto:supportnoteremainderhelp.com@gmail.com?subject=Support Request - Reminder Note App&body=Hi Support Team,%0D%0A%0D%0APlease describe your issue or question here:%0D%0A%0D%0A"
              className="contact-support-btn"
            >
              📧 Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Recently deleted view
  if (showDeleted) {
    return (
      <div className="profile-page">
        <div className="settings-header">
          <button className="back-btn" onClick={() => setShowDeleted(false)}>‹</button>
          <h2 className="settings-title">Recently Deleted</h2>
        </div>
        <div className="deleted-notes-list">
          {deletedNotes.length === 0 ? (
            <p className="deleted-empty">No recently deleted notes.</p>
          ) : (
            deletedNotes.map((note) => (
              <div key={note.id} className="deleted-note-item">
                <div className="deleted-note-info">
                  <span className="deleted-note-title">{note.title}</span>
                  {note.body ? <span className="deleted-note-body">{note.body}</span> : null}
                </div>
                <div className="deleted-note-actions">
                  <button
                    className="restore-btn"
                    onClick={() => onRestoreNote(note.id)}
                    title="Restore"
                  >
                    ↩ Restore
                  </button>
                  <button
                    className="perm-delete-btn"
                    onClick={() => onPermanentlyDeleteNote(note.id)}
                    title="Delete permanently"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // If settings is open, show settings view
  if (showSettings) {
    return (
      <div className="profile-page">
        <div className="settings-header">
          <button className="back-btn" onClick={() => setShowSettings(false)}>
            ‹
          </button>
          <h2 className="settings-title">Settings</h2>
        </div>

        <div className="settings-content">
          {/* Theme Setting */}
          <div className="setting-item-toggle">
            <div className="setting-info">
              <span className="setting-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
              <div className="setting-text">
                <h4 className="setting-label">Theme</h4>
                <p className="setting-description">
                  {theme === 'light' ? 'Light mode' : 'Dark mode'}
                </p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={onToggleTheme}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Notifications Setting */}
          <div className="setting-item-toggle">
            <div className="setting-info">
              <span className="setting-icon">🔔</span>
              <div className="setting-text">
                <h4 className="setting-label">Notifications</h4>
                <p className="setting-description">
                  {notificationsEnabled
                    ? 'Enabled - Reminders will repeat every 5 minutes'
                    : 'Disabled - No reminders will be sent'}
                </p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={onToggleNotifications}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Ringtone Setting */}
          <div className="setting-item-toggle ringtone-setting">
            <div className="setting-info">
              <span className="setting-icon">🎵</span>
              <div className="setting-text">
                <h4 className="setting-label">Reminder Ringtone</h4>
                <p className="setting-description">Choose your reminder sound</p>
              </div>
            </div>
            <div className="ringtone-list">
              {allRingtones.map((r) => (
                <div
                  key={r.path}
                  className={`ringtone-item ${selectedRingtone === r.path ? 'ringtone-selected' : ''}`}
                  onClick={() => onRingtoneChange(r.path)}
                >
                  <span className="ringtone-icon">{r.icon}</span>
                  <span className="ringtone-label">{r.label}</span>
                  <button
                    className={`ringtone-preview-btn ${playingPath === r.path ? 'ringtone-playing' : ''}`}
                    onClick={(e) => { e.stopPropagation(); previewRingtone(r.path); }}
                    title={playingPath === r.path ? 'Pause' : 'Preview'}
                  >
                    {playingPath === r.path ? '⏸' : '▶'}
                  </button>
                  {selectedRingtone === r.path && <span className="ringtone-check">✓</span>}
                  {r.custom && (
                    <button
                      className="ringtone-delete-btn"
                      disabled={deletingRingtoneId === r.id || ringtoneLoading}
                      onClick={(e) => { e.stopPropagation(); handleDeleteCustomRingtone(r.id); }}
                      title="Remove"
                    >
                      {deletingRingtoneId === r.id ? '⏳' : '✕'}
                    </button>
                  )}
                </div>
              ))}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={handleAddRingtone}
              />
              <button
                className="ringtone-add-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingRingtone || ringtoneLoading}
              >
                {uploadingRingtone ? '⏳ Uploading...' : '+ Add Ringtone'}
              </button>
              {ringtoneError && (
                <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Error: {ringtoneError}
                </p>
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <button className="signout-button" onClick={onSignOut}>
            <span className="setting-icon">⏻</span>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  // Default profile view
  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={user.photoURL} alt={user.displayName} className="profile-avatar-large" />
        <h2 className="profile-email">{user.email}</h2>
        <p className="profile-welcome">Welcome to Notes</p>
      </div>

      {/* My records section */}
      <div className="my-records-section">
        <h3 className="records-title">My records</h3>
        <div className="records-counts">
          <div className="record-item">
            <span className="record-label">Notes</span>
            <span className="record-count">{notesCount}</span>
          </div>
          <div className="record-item">
            <span className="record-label">To-do</span>
            <span className="record-count">{todosCount}</span>
          </div>
        </div>
      </div>

     
      {/* Other settings section */}
      <div className="profile-section">
        <h3 className="section-title">Other settings</h3>

        

        <button className="setting-item-nav" onClick={() => setShowDeleted(true)}>
          <div className="nav-content">
            <span className="setting-label">Recently deleted</span>
            <span className="deleted-count">{deletedCount}</span>
          </div>
          <span className="nav-arrow">›</span>
        </button>

        <button className="setting-item-nav" onClick={() => setShowSettings(true)}>
          <span className="setting-label">Settings</span>
          <span className="nav-arrow">›</span>
        </button>

        <button className="setting-item-nav" onClick={() => setShowFAQ(true)}>
          <span className="setting-label">FAQ & Help</span>
          <span className="nav-arrow">›</span>
        </button>

        <a
          href="mailto:supportnoteremainderhelp.com@gmail.com?subject=Support Request - Reminder Note App&body=Hi Support Team,%0D%0A%0D%0APlease describe your issue or question here:%0D%0A%0D%0A"
          className="setting-item-nav contact-support-link"
        >
          <span className="setting-label">Contact Support</span>
          <span className="nav-arrow">›</span>
        </a>
      </div>
    </div>
  );
};
