/**
 * Fake Data Generator
 * Generates realistic test data for notes, todos, and reminders
 * Used for testing the AI Summary feature
 */

// Sample note titles
const NOTE_TITLES = [
  'Team Meeting Notes',
  'Project Brainstorm Ideas',
  'Weekly Goals & Objectives',
  'Client Presentation Prep',
  'Code Review Feedback',
  'Research Findings Summary',
  'Budget Planning Discussion',
  'Marketing Campaign Ideas',
  'Product Roadmap Updates',
  'Design System Documentation',
  'API Integration Notes',
  'Database Schema Review',
  'Sprint Planning Notes',
  'Performance Optimization',
  'Security Audit Results',
  'User Feedback Analysis',
  'Feature Requirements Doc',
  'Technical Architecture',
  'Quarterly Review Notes',
  'Innovation Workshop Ideas'
];

// Sample todo titles
const TODO_TITLES = [
  'Buy groceries',
  'Call dentist',
  'Schedule car maintenance',
  'Pay utility bills',
  'Submit expense report',
  'Review contract documents',
  'Send follow-up email',
  'Update project timeline',
  'Book flight tickets',
  'Renew gym membership',
  'Pick up dry cleaning',
  'Prepare presentation slides',
  'Review pull requests',
  'Write blog post',
  'Update resume',
  'Plan team outing',
  'Order office supplies',
  'Schedule doctor appointment',
  'Backup important files',
  'Clean workspace'
];

// Sample note bodies
const NOTE_BODIES = [
  'Discussed key objectives and action items. Team is aligned on priorities for Q2. Follow-up meeting scheduled for next week.',
  'Brainstormed innovative solutions for upcoming challenges. Identified three potential approaches worth exploring further.',
  'Set clear milestones and success metrics. Everyone committed to their deliverables. Great momentum building.',
  'Reviewed client requirements and expectations. Preparing comprehensive proposal with timeline and budget breakdown.',
  'Identified several areas for improvement in code quality. Implementing best practices and refactoring legacy modules.',
  'Compiled research data from multiple sources. Key insights will inform our strategic direction moving forward.',
  'Analyzed spending patterns and identified cost-saving opportunities. Budget reallocation proposed for next quarter.',
  'Generated creative concepts for upcoming launch. Focus on customer engagement and brand storytelling.',
  'Updated feature priorities based on user feedback. Adjusting timeline to accommodate high-impact improvements.',
  'Documented design patterns and component guidelines. Ensuring consistency across all product interfaces.',
  'Completed integration with third-party services. Testing environment ready for QA team review.',
  'Optimized database queries and improved indexing strategy. Performance gains of 40% in key operations.',
  'Planned upcoming sprint with clear priorities. Team capacity looks good for next two weeks.',
  'Identified performance bottlenecks and optimization opportunities. Implementation plan approved by architecture team.',
  'Conducted comprehensive security review. Addressed vulnerabilities and updated security protocols.',
  'Analyzed user feedback from latest release. Positive reception with some areas for enhancement identified.',
  'Documented functional and technical requirements. Stakeholders aligned on scope and deliverables.',
  'Designed scalable architecture for new microservices. Cloud infrastructure planning complete.',
  'Reviewed quarterly metrics and KPIs. Overall performance exceeded targets across most categories.',
  'Captured innovative ideas for future product development. Several concepts ready for feasibility analysis.'
];

/**
 * Generate random date within a range
 */
const getRandomDate = (startDaysAgo, endDaysAgo) => {
  const now = Date.now();
  const start = now - startDaysAgo * 24 * 60 * 60 * 1000;
  const end = now - endDaysAgo * 24 * 60 * 60 * 1000;
  return new Date(start + Math.random() * (end - start));
};

/**
 * Generate random future date
 */
const getRandomFutureDate = (minDays, maxDays) => {
  const now = Date.now();
  const start = now + minDays * 24 * 60 * 60 * 1000;
  const end = now + maxDays * 24 * 60 * 60 * 1000;
  const date = new Date(start + Math.random() * (end - start));

  // Set random time between 8 AM and 8 PM
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

  date.setHours(hour, minute, 0, 0);
  return date;
};

/**
 * Get random item from array
 */
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate fake notes
 * @param {number} count - Number of notes to generate
 * @returns {Array} Array of fake note objects
 */
export const generateFakeNotes = (count = 10) => {
  const notes = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const createdDate = getRandomDate(14, 0); // Last 14 days
    const wasUpdated = Math.random() > 0.6; // 40% chance of being updated
    const updatedDate = wasUpdated
      ? new Date(createdDate.getTime() + Math.random() * (now - createdDate.getTime()))
      : createdDate;

    // Random reminder time (mix of past, present, future)
    const reminderDaysOffset = Math.floor(Math.random() * 30) - 10; // -10 to +20 days
    const reminderDate = getRandomFutureDate(reminderDaysOffset, reminderDaysOffset + 1);

    // Some reminders were triggered
    const reminderIsPast = reminderDate < new Date();
    const wasTriggered = reminderIsPast && Math.random() > 0.3; // 70% of past reminders triggered

    const note = {
      id: `fake-note-${Date.now()}-${i}`,
      title: getRandomItem(NOTE_TITLES),
      body: getRandomItem(NOTE_BODIES),
      reminderTime: reminderDate.toISOString(),
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
      completed: false,
      deleted: false,
      type: 'note',
      reminderTriggeredAt: wasTriggered ? new Date(reminderDate.getTime() + Math.random() * 60 * 60 * 1000).toISOString() : null,
      isFakeData: true // Mark as fake for easy cleanup
    };

    notes.push(note);
  }

  return notes;
};

/**
 * Generate fake todos
 * @param {number} count - Number of todos to generate
 * @returns {Array} Array of fake todo objects
 */
export const generateFakeTodos = (count = 8) => {
  const todos = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const createdDate = getRandomDate(10, 0); // Last 10 days
    const isCompleted = Math.random() > 0.5; // 50% completion rate
    const completedDate = isCompleted
      ? new Date(createdDate.getTime() + Math.random() * (now - createdDate.getTime()))
      : null;

    // Reminder time
    const reminderDaysOffset = Math.floor(Math.random() * 15) - 5; // -5 to +10 days
    const reminderDate = getRandomFutureDate(reminderDaysOffset, reminderDaysOffset + 1);

    // Triggered status
    const reminderIsPast = reminderDate < new Date();
    const wasTriggered = reminderIsPast && Math.random() > 0.4;

    const todo = {
      id: `fake-todo-${Date.now()}-${i}`,
      title: getRandomItem(TODO_TITLES),
      body: '',
      reminderTime: reminderDate.toISOString(),
      createdAt: createdDate.toISOString(),
      updatedAt: completedDate ? completedDate.toISOString() : createdDate.toISOString(),
      completed: isCompleted,
      completedAt: completedDate ? completedDate.toISOString() : null,
      deleted: false,
      type: 'todo',
      reminderTriggeredAt: wasTriggered ? new Date(reminderDate.getTime() + Math.random() * 30 * 60 * 1000).toISOString() : null,
      isFakeData: true
    };

    todos.push(todo);
  }

  return todos;
};

/**
 * Generate fake deleted notes
 * @param {number} count - Number of deleted notes to generate
 * @returns {Array} Array of fake deleted note objects
 */
export const generateFakeDeletedNotes = (count = 5) => {
  const deletedNotes = [];

  for (let i = 0; i < count; i++) {
    const createdDate = getRandomDate(20, 7); // Created 7-20 days ago
    const deletedDate = getRandomDate(7, 0); // Deleted in last 7 days

    const isNote = Math.random() > 0.5;

    const deletedNote = {
      id: `fake-deleted-${Date.now()}-${i}`,
      title: isNote ? getRandomItem(NOTE_TITLES) : getRandomItem(TODO_TITLES),
      body: isNote ? getRandomItem(NOTE_BODIES) : '',
      reminderTime: getRandomFutureDate(0, 10).toISOString(),
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      deletedAt: deletedDate.toISOString(),
      deleted: true,
      completed: false,
      type: isNote ? 'note' : 'todo',
      isFakeData: true
    };

    deletedNotes.push(deletedNote);
  }

  return deletedNotes;
};

/**
 * Generate complete fake dataset
 * @param {Object} options - Generation options
 * @returns {Object} Object with notes, todos, and deletedNotes arrays
 */
export const generateCompleteDataset = (options = {}) => {
  const {
    notesCount = 10,
    todosCount = 8,
    deletedCount = 5
  } = options;

  const notes = generateFakeNotes(notesCount);
  const todos = generateFakeTodos(todosCount);
  const deletedNotes = generateFakeDeletedNotes(deletedCount);

  // Combine notes and todos
  const allNotes = [...notes, ...todos];

  return {
    notes: allNotes,
    deletedNotes: deletedNotes,
    stats: {
      totalGenerated: allNotes.length + deletedNotes.length,
      notes: notes.length,
      todos: todos.length,
      deleted: deletedNotes.length,
      completed: todos.filter(t => t.completed).length,
      withReminders: allNotes.filter(n => n.reminderTime).length,
      triggered: allNotes.filter(n => n.reminderTriggeredAt).length
    }
  };
};

/**
 * Clear all fake data from arrays
 * @param {Array} notes - Notes array
 * @param {Array} deletedNotes - Deleted notes array
 * @returns {Object} Cleaned arrays
 */
export const clearFakeData = (notes, deletedNotes) => {
  return {
    notes: notes.filter(n => !n.isFakeData),
    deletedNotes: deletedNotes.filter(n => !n.isFakeData)
  };
};

/**
 * Check if data contains fake items
 * @param {Array} notes - Notes array
 * @returns {boolean} True if fake data exists
 */
export const hasFakeData = (notes) => {
  return notes.some(n => n.isFakeData);
};

/**
 * Count fake items
 * @param {Array} notes - Notes array
 * @param {Array} deletedNotes - Deleted notes array
 * @returns {Object} Count of fake items
 */
export const countFakeData = (notes, deletedNotes) => {
  return {
    notes: notes.filter(n => n.isFakeData).length,
    deletedNotes: deletedNotes.filter(n => n.isFakeData).length,
    total: [...notes, ...deletedNotes].filter(n => n.isFakeData).length
  };
};

/**
 * Generate preset scenarios for testing
 */
export const TEST_SCENARIOS = {
  // Productive user scenario
  productive: () => generateCompleteDataset({
    notesCount: 15,
    todosCount: 12,
    deletedCount: 3
  }),

  // New user scenario
  newUser: () => generateCompleteDataset({
    notesCount: 2,
    todosCount: 3,
    deletedCount: 0
  }),

  // Heavy user scenario
  heavyUser: () => generateCompleteDataset({
    notesCount: 25,
    todosCount: 20,
    deletedCount: 10
  }),

  // Minimal user scenario
  minimal: () => generateCompleteDataset({
    notesCount: 5,
    todosCount: 5,
    deletedCount: 2
  })
};
