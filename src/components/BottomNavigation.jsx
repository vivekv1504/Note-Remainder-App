import './BottomNavigation.css';

export const BottomNavigation = ({ activeTab, onTabChange, onSignOut, userPhoto }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => onTabChange('notes')}
      >
        <span className="nav-icon">📝</span>
        <span className="nav-label">Notes</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`}
        onClick={() => onTabChange('todo')}
      >
        <span className="nav-icon">✓</span>
        <span className="nav-label">To-do</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'me' ? 'active' : ''}`}
        onClick={() => onTabChange('me')}
      >
        {userPhoto ? (
          <img src={userPhoto} alt="Profile" className="nav-avatar" />
        ) : (
          <span className="nav-icon">👤</span>
        )}
        <span className="nav-label">Me</span>
      </button>
    </nav>
  );
};
