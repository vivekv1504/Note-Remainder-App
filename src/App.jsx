import { useState, useMemo, lazy, Suspense } from 'react'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './toast-custom.css'
import { useAuth } from './hooks/useAuth'
import { useNotes } from './hooks/useNotes'
import { useNotifications } from './hooks/useNotifications'
import { useTheme } from './hooks/useTheme'
import { Login } from './components/Login'
import { NoteCard } from './components/NoteCard'
import { FloatingActionButton } from './components/FloatingActionButton'
import { BottomNavigation } from './components/BottomNavigation'
import { NoteModal } from './components/NoteModal'
import { ProfilePage } from './components/ProfilePage'
import { QuickTodo } from './components/QuickTodo'
import { SummaryView } from './components/SummaryView'

const TestDataPanel = import.meta.env.DEV
  ? lazy(() => import('./components/TestDataPanel').then((module) => ({ default: module.TestDataPanel })))
  : null;

function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut } = useAuth();
  const { notes, deletedNotes, loading: notesLoading, addNote, updateNote, deleteNote, restoreNote, permanentlyDeleteNote, toggleComplete, markReminderTriggered } = useNotes(user?.uid);
  const { notificationsEnabled, toggleNotifications, selectedRingtone, setRingtone } = useNotifications(notes, user?.uid, toggleComplete, markReminderTriggered);
  const { theme, toggleTheme } = useTheme(user?.uid);

  const [activeTab, setActiveTab] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickTodo, setShowQuickTodo] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showSummaryView, setShowSummaryView] = useState(false);

  // Handlers for Test Data Panel
  const handleAddFakeData = async (fakeNotes, fakeDeletedNotes) => {
    // Add fake notes to Firebase with isFakeData flag
    for (const note of fakeNotes) {
      await addNote(note.title, note.body, note.reminderTime, note.type, true);
    }
    // Note: fake deleted notes would need special handling
    // For now, we'll just add them as regular notes
    console.log('✅ Added', fakeNotes.length, 'fake notes');
  };

  const handleClearFakeData = async (cleanedNotes, cleanedDeletedNotes) => {
    // Delete fake notes from Firebase
    const fakeNotes = notes.filter(n => n.isFakeData);
    for (const note of fakeNotes) {
      await deleteNote(note.id);
    }
    console.log('✅ Cleared', fakeNotes.length, 'fake notes');
  };

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by tab
    if (activeTab === 'todo') {
      filtered = filtered.filter((note) => note.type === 'todo' && !note.completed);
    } else if (activeTab === 'notes') {
      filtered = filtered.filter((note) => !note.type || note.type === 'note');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((note) =>
        note.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notes, activeTab, searchQuery]);

  const handleAddNote = () => {
    setEditingNote(null);
    if (activeTab === 'todo') {
      setShowQuickTodo(true);
    } else {
      setShowNoteModal(true);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    if (activeTab === 'todo') {
      // For to-do tab, use quick todo editor
      setShowQuickTodo(true);
    } else {
      // For notes tab, use full modal
      setShowNoteModal(true);
    }
  };

  const handleSaveNote = async (title, body, reminderTime) => {
    if (editingNote) {
      await updateNote(editingNote.id, { title, body, reminderTime });
    } else {
      await addNote(title, body, reminderTime);
    }
    setShowNoteModal(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const handleQuickTodoSave = async (title, reminderTime) => {
    await addNote(title, '', reminderTime, 'todo');
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="app loading-state">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <Login onSignIn={signInWithGoogle} error={authError} />;
  }

  // Show main app if user is authenticated
  return (
    <div className="app">
      <header className="app-header-new">
        <div className="header-left">
          <div className={`header-icon ${activeTab === 'todo' ? 'header-icon-todo' : ''}`}>
            {activeTab === 'todo' ? '✓' : '📝'}
          </div>
          <div className="header-title-section">
            <h1 className="header-title">
              {activeTab === 'todo' ? 'To-do' : 'Remainder Notes'}
            </h1>
            {activeTab !== 'me' && (
              <p className="notes-count">
                {filteredNotes.length} {activeTab === 'todo' ? 'to-dos' : 'notes'}
              </p>
            )}
          </div>
        </div>

        <div className="header-right">
          {activeTab !== 'me' && (
            <>
              <button
                className="header-btn"
                onClick={() => setShowSummaryView(true)}
                title="AI Summary"
              >
                📊
              </button>
              {import.meta.env.DEV && (
                <button
                  className="header-btn"
                  onClick={() => setShowTestPanel(!showTestPanel)}
                  title="Test Mode"
                >
                  🧪
                </button>
              )}
            </>
          )}
          <button
            className="header-btn"
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
          >
            🔍
          </button>
        </div>
      </header>

      {showSearch && (
        <div className="search-bar-new">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for Notes, TODO's, and others"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-new"
            autoFocus
          />

          <button
            className="search-close"
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      )}

      <main className="app-main-new">
        {activeTab === 'me' ? (
          <ProfilePage
            user={user}
            notes={notes}
            deletedNotes={deletedNotes}
            onRestoreNote={restoreNote}
            onPermanentlyDeleteNote={permanentlyDeleteNote}
            theme={theme}
            onToggleTheme={toggleTheme}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={toggleNotifications}
            selectedRingtone={selectedRingtone}
            onRingtoneChange={setRingtone}
            onSignOut={signOut}
          />
        ) : (
          <>
            {notesLoading ? (
              <div className="notes-loading">
                <div className="spinner-small"></div>
                <p>Loading your notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="empty-state">
                {activeTab === 'todo' ? (
                  <>
                    <div className="empty-icon-circle">
                      <span className="empty-checkmark">✓</span>
                    </div>
                    <p className="empty-text">No tasks</p>
                  </>
                ) : (
                  <>
                    <span className="empty-icon">📝</span>
                    <p className="empty-text">
                      {searchQuery ? 'No notes found' : 'No notes yet'}
                    </p>
                    {!searchQuery && (
                      <p className="empty-hint">Tap the + button to create a note</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => handleEditNote(note)}
                    onToggleComplete={toggleComplete}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {activeTab !== 'me' && (
        <FloatingActionButton onClick={handleAddNote} />
      )}

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={signOut}
        userPhoto={user.photoURL}
      />

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        note={editingNote}
      />

      <QuickTodo
        isOpen={showQuickTodo}
        onClose={() => {
          setShowQuickTodo(false);
          setEditingNote(null);
        }}
        onSave={handleQuickTodoSave}
        onUpdate={updateNote}
        onDelete={handleDeleteNote}
        note={editingNote}
      />

      {/* Toast notifications */}
      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        autoClose={20000}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        rtl={false}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />

      {/* AI Summary View */}
      {showSummaryView && (
        <SummaryView
          notes={notes}
          deletedNotes={deletedNotes}
          onBack={() => setShowSummaryView(false)}
        />
      )}

      {/* Test Data Panel - Controlled by header button */}
      {import.meta.env.DEV && user && showTestPanel && TestDataPanel && (
        <Suspense fallback={null}>
          <TestDataPanel
            notes={notes}
            deletedNotes={deletedNotes}
            onAddFakeData={handleAddFakeData}
            onClearFakeData={handleClearFakeData}
            onClose={() => setShowTestPanel(false)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default App
