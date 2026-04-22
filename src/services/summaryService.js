/**
 * Summary Service
 * Aggregates and analyzes user's notes, todos, and reminders data
 */

/**
 * Main function to get comprehensive summary data
 * @param {Array} notes - Array of all notes/todos
 * @param {Array} deletedNotes - Array of deleted notes
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Object} Aggregated summary data
 */
export const getSummaryData = (notes, deletedNotes, days = 7) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const notesArray = notes || [];
  const deletedArray = deletedNotes || [];

  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      days: days
    },
    notes: {
      total: notesArray.length,
      created: getRecentCreated(notesArray, startDate),
      updated: getRecentUpdated(notesArray, startDate),
      deleted: getRecentDeleted(deletedArray, startDate)
    },
    todos: {
      total: notesArray.filter(n => n.type === 'todo').length,
      created: getRecentCreated(notesArray.filter(n => n.type === 'todo'), startDate),
      completed: getRecentCompleted(notesArray, startDate),
      pending: notesArray.filter(n => n.type === 'todo' && !n.completed).length
    },
    reminders: {
      triggered: getTriggeredReminders(notesArray, startDate),
      due: getDueReminders(notesArray),
      overdue: getOverdueReminders(notesArray),
      upcoming: getUpcomingReminders(notesArray, 7)
    },
    insights: calculateInsights(notesArray, days)
  };
};

const toDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Get recently created items
 */
const getRecentCreated = (items, startDate) => {
  return items.filter(item => {
    if (!item.createdAt) return false;
    const createdDate = toDate(item.createdAt);
    if (!createdDate) return false;
    return createdDate >= startDate;
  });
};

/**
 * Get recently updated items
 */
const getRecentUpdated = (items, startDate) => {
  return items.filter(item => {
    if (!item.updatedAt || !item.createdAt) return false;
    const updatedDate = toDate(item.updatedAt);
    const createdDate = toDate(item.createdAt);
    if (!updatedDate || !createdDate) return false;
    // Only count if updated after creation
    return updatedDate > createdDate && updatedDate >= startDate;
  });
};

/**
 * Get recently deleted items
 */
const getRecentDeleted = (items, startDate) => {
  return items.filter(item => {
    if (!item.deletedAt) return false;
    const deletedDate = toDate(item.deletedAt);
    if (!deletedDate) return false;
    return deletedDate >= startDate;
  });
};

/**
 * Get recently completed todos
 */
const getRecentCompleted = (items, startDate) => {
  return items.filter(item => {
    if (!item.completed || !item.completedAt) return false;
    const completedDate = toDate(item.completedAt);
    if (!completedDate) return false;
    return completedDate >= startDate;
  });
};

/**
 * Get triggered reminders (reminders that fired in the past)
 */
const getTriggeredReminders = (items, startDate) => {
  return items.filter(item => {
    if (!item.reminderTriggeredAt) return false;
    const triggeredDate = toDate(item.reminderTriggeredAt);
    if (!triggeredDate) return false;
    return triggeredDate >= startDate;
  }).map(item => ({
    noteId: item.id,
    noteTitle: item.title,
    reminderTime: item.reminderTime,
    triggeredAt: item.reminderTriggeredAt,
    triggered: true
  }));
};

/**
 * Get due reminders (future reminders)
 */
const getDueReminders = (items) => {
  const now = new Date();
  return items.filter(item => {
    if (!item.reminderTime) return false;
    const reminderDate = toDate(item.reminderTime);
    if (!reminderDate) return false;
    return reminderDate >= now && !item.completed && !item.reminderTriggeredAt;
  }).map(item => ({
    noteId: item.id,
    noteTitle: item.title,
    reminderTime: item.reminderTime,
    triggered: false
  }));
};

/**
 * Get overdue reminders (past reminders that weren't triggered/completed)
 */
const getOverdueReminders = (items) => {
  const now = new Date();
  return items.filter(item => {
    if (!item.reminderTime) return false;
    const reminderDate = toDate(item.reminderTime);
    if (!reminderDate) return false;
    return reminderDate < now && !item.completed && !item.reminderTriggeredAt;
  }).map(item => ({
    noteId: item.id,
    noteTitle: item.title,
    reminderTime: item.reminderTime,
    daysOverdue: Math.floor((now - toDate(item.reminderTime)) / (1000 * 60 * 60 * 24))
  }));
};

/**
 * Get upcoming reminders within specified days
 */
const getUpcomingReminders = (items, days) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return items.filter(item => {
    if (!item.reminderTime) return false;
    const reminderDate = toDate(item.reminderTime);
    if (!reminderDate) return false;
    return reminderDate >= now &&
           reminderDate <= futureDate &&
           !item.completed;
  })
  .map(item => ({
    noteId: item.id,
    noteTitle: item.title,
    reminderTime: item.reminderTime,
    daysUntil: Math.ceil((toDate(item.reminderTime) - now) / (1000 * 60 * 60 * 24))
  }))
  .sort((a, b) => toDate(a.reminderTime) - toDate(b.reminderTime));
};

/**
 * Calculate productivity insights
 */
const calculateInsights = (items, days) => {
  if (!items || items.length === 0) {
    return {
      mostActiveDay: 'No data',
      mostActiveTime: 'No data',
      productivityScore: 0,
      streakDays: 0,
      averageNotesPerDay: 0,
      completionRate: 0
    };
  }

  // Calculate activity by day of week
  const activityByDay = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  items.forEach(item => {
    if (item.createdAt) {
      const date = toDate(item.createdAt);
      if (!date) return;
      const dayName = dayNames[date.getDay()];
      activityByDay[dayName] = (activityByDay[dayName] || 0) + 1;
    }
  });

  const mostActiveDay = Object.keys(activityByDay).reduce((a, b) =>
    activityByDay[a] > activityByDay[b] ? a : b,
    'No data'
  );

  // Calculate activity by hour
  const activityByHour = {};
  items.forEach(item => {
    if (item.createdAt) {
      const date = toDate(item.createdAt);
      if (!date) return;
      const hour = date.getHours();
      activityByHour[hour] = (activityByHour[hour] || 0) + 1;
    }
  });

  const mostActiveHour = Object.keys(activityByHour).reduce((a, b) =>
    activityByHour[a] > activityByHour[b] ? a : b,
    12
  );

  const mostActiveTime = formatHour(parseInt(mostActiveHour));

  // Calculate productivity score (0-100)
  const completedTodos = items.filter(i => i.type === 'todo' && i.completed).length;
  const totalTodos = items.filter(i => i.type === 'todo').length;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const recentActivity = items.filter(i => {
    if (!i.createdAt) return false;
    const createdDate = toDate(i.createdAt);
    if (!createdDate) return false;
    const daysSince = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
    return daysSince <= days;
  }).length;

  const averageNotesPerDay = recentActivity / days;

  // Calculate streak days first (needed for productivity score)
  const streakDays = calculateStreakDays(items);

  // Score based on: completion rate (50%), activity level (30%), consistency (20%)
  const activityScore = Math.min((averageNotesPerDay / 3) * 30, 30);
  const consistencyScore = Math.min((streakDays / 7) * 20, 20);
  const productivityScore = Math.round(completionRate * 0.5 + activityScore + consistencyScore);

  return {
    mostActiveDay,
    mostActiveTime,
    productivityScore: Math.min(productivityScore, 100),
    streakDays,
    averageNotesPerDay: Math.round(averageNotesPerDay * 10) / 10,
    completionRate: Math.round(completionRate)
  };
};

/**
 * Calculate consecutive days of activity
 */
const calculateStreakDays = (items) => {
  if (!items || items.length === 0) return 0;

  const dates = items
    .filter(item => item.createdAt)
    .map(item => {
      const date = toDate(item.createdAt);
      if (!date) return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    })
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => b - a);

  if (dates.length === 0) return 0;

  let streak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  // Check if most recent activity was today or yesterday
  if (dates[0] !== todayMs && dates[0] !== todayMs - oneDayMs) {
    return 0;
  }

  // Count consecutive days
  for (let i = 1; i < dates.length; i++) {
    const diff = dates[i - 1] - dates[i];
    if (diff === oneDayMs) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Format hour to readable time
 */
const formatHour = (hour) => {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

/**
 * Get summary statistics for display
 */
export const getSummaryStats = (summaryData) => {
  return {
    totalNotes: summaryData.notes.total,
    notesCreated: summaryData.notes.created.length,
    notesUpdated: summaryData.notes.updated.length,
    notesDeleted: summaryData.notes.deleted.length,
    todosTotal: summaryData.todos.total,
    todosCompleted: summaryData.todos.completed.length,
    todosPending: summaryData.todos.pending,
    remindersTriggered: summaryData.reminders.triggered.length,
    remindersDue: summaryData.reminders.due.length,
    remindersOverdue: summaryData.reminders.overdue.length,
    remindersUpcoming: summaryData.reminders.upcoming.length,
    productivityScore: summaryData.insights.productivityScore,
    streakDays: summaryData.insights.streakDays
  };
};

/**
 * Format summary data for LLM prompt
 */
export const formatSummaryForLLM = (summaryData) => {
  const stats = getSummaryStats(summaryData);
  const insights = summaryData.insights;

  return {
    overview: {
      period: `Last ${summaryData.period.days} days`,
      totalNotes: stats.totalNotes,
      totalTodos: stats.todosTotal
    },
    activity: {
      created: stats.notesCreated,
      updated: stats.notesUpdated,
      deleted: stats.notesDeleted,
      todosCompleted: stats.todosCompleted
    },
    reminders: {
      triggered: stats.remindersTriggered,
      upcoming: stats.remindersUpcoming,
      overdue: stats.remindersOverdue
    },
    insights: {
      mostActiveDay: insights.mostActiveDay,
      mostActiveTime: insights.mostActiveTime,
      productivityScore: insights.productivityScore,
      streakDays: insights.streakDays,
      averagePerDay: insights.averageNotesPerDay,
      completionRate: insights.completionRate
    },
    recentTitles: summaryData.notes.created.slice(0, 5).map(n => n.title),
    overdueTitles: summaryData.reminders.overdue.slice(0, 3).map(r => r.noteTitle)
  };
};
