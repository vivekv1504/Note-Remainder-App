import { useState } from 'react';
import {
  generateCompleteDataset,
  clearFakeData,
  hasFakeData,
  countFakeData,
  TEST_SCENARIOS
} from '../utils/fakeDataGenerator';
import './TestDataPanel.css';

export const TestDataPanel = ({ notes, deletedNotes, onAddFakeData, onClearFakeData, onClose }) => {
  const [notesCount, setNotesCount] = useState(10);
  const [todosCount, setTodosCount] = useState(8);
  const [deletedCount, setDeletedCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const fakeDataExists = hasFakeData(notes);
  const fakeDataCount = fakeDataExists ? countFakeData(notes, deletedNotes) : null;

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const dataset = generateCompleteDataset({
        notesCount,
        todosCount,
        deletedCount
      });

      // Pass generated data to parent
      await onAddFakeData(dataset.notes, dataset.deletedNotes);

      // Show success message
      alert(`✅ Generated ${dataset.stats.totalGenerated} fake items!\n\n` +
        `• ${dataset.stats.notes} Notes\n` +
        `• ${dataset.stats.todos} Todos\n` +
        `• ${dataset.stats.deleted} Deleted\n` +
        `• ${dataset.stats.completed} Completed\n\n` +
        `Fake data is marked and will persist until cleared.`
      );

    } catch (error) {
      console.error('Error generating fake data:', error);
      alert('❌ Failed to generate fake data. Check console for errors.');
    } finally {
      setGenerating(false);
    }
  };

  const handleScenario = async (scenarioName) => {
    setGenerating(true);

    try {
      const dataset = TEST_SCENARIOS[scenarioName]();
      await onAddFakeData(dataset.notes, dataset.deletedNotes);

      alert(`✅ Applied "${scenarioName}" scenario!\n\n` +
        `Generated ${dataset.stats.totalGenerated} items.`
      );
    } catch (error) {
      console.error('Error applying scenario:', error);
      alert('❌ Failed to apply scenario. Check console.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = async () => {
    if (!fakeDataExists) {
      alert('ℹ️ No fake data to clear!');
      return;
    }

    const confirmed = window.confirm(
      `Clear ${fakeDataCount.total} fake items?\n\n` +
      `• ${fakeDataCount.notes} Notes/Todos\n` +
      `• ${fakeDataCount.deletedNotes} Deleted\n\n` +
      `This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const cleaned = clearFakeData(notes, deletedNotes);
      await onClearFakeData(cleaned.notes, cleaned.deletedNotes);
      alert('✅ All fake data cleared!');
    } catch (error) {
      console.error('Error clearing fake data:', error);
      alert('❌ Failed to clear fake data. Check console.');
    }
  };

  return (
    <div className="test-data-panel" onClick={onClose}>
      <div className="test-controls" onClick={(e) => e.stopPropagation()}>
          <div className="test-header">
            <button className="test-back-btn" onClick={onClose}>‹</button>
            <div className="test-header-content">
              <h4>🧪 Fake Data Generator</h4>
              <p className="test-subtitle">Generate test data for AI Summary</p>
            </div>
          </div>

          {fakeDataExists && (
            <div className="test-status">
              <div className="status-info">
                <div className="status-icon">⚠️</div>
                <div className="status-text">
                  <strong>{fakeDataCount.total} fake items</strong> in database
                  <br />
                  <small>Clear to generate fresh data</small>
                </div>
              </div>
              <button
                className="clear-btn-compact"
                onClick={handleClear}
                disabled={generating}
              >
                <span>🗑️</span>
                Clear All
              </button>
            </div>
          )}

          {/* Quick Scenarios */}
          <div className="test-section">
            <h5>Quick Scenarios</h5>
            <div className="scenario-buttons">
              <button
                className="scenario-btn"
                onClick={() => handleScenario('newUser')}
                disabled={generating}
              >
                <span>👶</span>
                <span>New User</span>
                <small>5 items</small>
              </button>
              <button
                className="scenario-btn"
                onClick={() => handleScenario('minimal')}
                disabled={generating}
              >
                <span>📝</span>
                <span>Minimal</span>
                <small>12 items</small>
              </button>
              <button
                className="scenario-btn"
                onClick={() => handleScenario('productive')}
                disabled={generating}
              >
                <span>🚀</span>
                <span>Productive</span>
                <small>30 items</small>
              </button>
              <button
                className="scenario-btn"
                onClick={() => handleScenario('heavyUser')}
                disabled={generating}
              >
                <span>⚡</span>
                <span>Heavy User</span>
                <small>55 items</small>
              </button>
            </div>
          </div>

          <div className="test-divider"></div>

          {/* Custom Generation */}
          <div className="test-section">
            <h5>Custom Generation</h5>
            <div className="input-group">
              <label>
                Notes: <strong>{notesCount}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={notesCount}
                onChange={(e) => setNotesCount(parseInt(e.target.value))}
                disabled={generating}
              />
            </div>

            <div className="input-group">
              <label>
                Todos: <strong>{todosCount}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={todosCount}
                onChange={(e) => setTodosCount(parseInt(e.target.value))}
                disabled={generating}
              />
            </div>

            <div className="input-group">
              <label>
                Deleted: <strong>{deletedCount}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="15"
                value={deletedCount}
                onChange={(e) => setDeletedCount(parseInt(e.target.value))}
                disabled={generating}
              />
            </div>

            <div className="generation-total">
              Total: <strong>{notesCount + todosCount + deletedCount}</strong> items
            </div>
          </div>

          {/* Action Buttons */}
          <div className="test-actions">
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="btn-spinner">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Data
                </>
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="test-warning">
            <strong>⚠️ Note:</strong> Fake data persists until cleared. It will appear in your notes list and AI summary. Use this for testing only.
          </div>
        </div>
    </div>
  );
};
