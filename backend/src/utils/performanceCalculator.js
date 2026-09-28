/**
 * Calculate weekly dates range (Monday to Sunday of the current week)
 */
export const getWeekDateRange = (refDate = new Date()) => {
  const current = new Date(refDate);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);

  const startOfWeek = new Date(current.setDate(diffToMonday));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

/**
 * Format Date to YYYY-MM-DD
 */
export const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Compute the comprehensive performance score for an employee
 */
export const calculatePerformanceScore = ({
  tasks = [],
  weeklyDurationMinutes = 0,
  targetWeeklyHours = 40,
  queries = [],
}) => {
  // 1. Task Score (45% weight)
  let taskScore = 80; // default baseline if no tasks
  let averageTaskProgress = 0;
  let tasksCompleted = 0;
  let tasksInProgress = 0;
  let tasksOverdue = 0;

  if (tasks.length > 0) {
    let totalTaskPoints = 0;
    const now = new Date();

    tasks.forEach((task) => {
      const isOverdue = task.status !== 'completed' && new Date(task.deadline) < now;
      if (isOverdue) tasksOverdue += 1;

      if (task.status === 'completed') {
        tasksCompleted += 1;
        // On-time completion bonus
        if (task.completedAt && new Date(task.completedAt) <= new Date(task.deadline)) {
          totalTaskPoints += 100;
        } else {
          totalTaskPoints += 90; // minor overdue penalty
        }
      } else {
        if (task.status === 'in_progress' || task.status === 'in_review') {
          tasksInProgress += 1;
        }
        // Points equal to current progress percentage with overdue deduction if applicable
        const overdueDeduction = isOverdue ? 15 : 0;
        totalTaskPoints += Math.max(0, (task.progressPercentage || 0) - overdueDeduction);
      }
    });

    taskScore = Math.min(100, Math.round(totalTaskPoints / tasks.length));
    averageTaskProgress = Math.round(
      tasks.reduce((sum, t) => sum + (t.progressPercentage || 0), 0) / tasks.length
    );
  }

  // 2. Working Hours Score (35% weight)
  const weeklyHoursLogged = parseFloat((weeklyDurationMinutes / 60).toFixed(1));
  const targetHours = targetWeeklyHours || 40;
  // Compute hours compliance ratio (capped at 100% for standard score, overtime recognized separately)
  const hoursRatio = targetHours > 0 ? (weeklyHoursLogged / targetHours) * 100 : 100;
  const hoursScore = Math.min(100, Math.round(hoursRatio));
  const overtimeHours = weeklyHoursLogged > targetHours ? parseFloat((weeklyHoursLogged - targetHours).toFixed(1)) : 0;

  // 3. Engagement & Resolution Score (20% weight)
  let queryScore = 85;
  const queriesTotal = queries.length;
  let queriesResolved = 0;

  if (queriesTotal > 0) {
    queriesResolved = queries.filter((q) => q.status === 'resolved').length;
    const resolutionRatio = (queriesResolved / queriesTotal) * 100;
    queryScore = Math.round(resolutionRatio);
  }

  // Aggregate weighted score
  const overallScore = Math.round(
    taskScore * 0.45 + hoursScore * 0.35 + queryScore * 0.20
  );

  // Determine performance tier
  let tier = 'Steady Contributor';
  let badgeColor = '#3b82f6'; // blue
  if (overallScore >= 90) {
    tier = 'Elite Performer';
    badgeColor = '#10b981'; // green
  } else if (overallScore >= 75) {
    tier = 'High Achiever';
    badgeColor = '#8b5cf6'; // purple
  } else if (overallScore < 60) {
    tier = 'Needs Attention';
    badgeColor = '#ef4444'; // red
  }

  return {
    score: overallScore,
    tier,
    badgeColor,
    breakdown: {
      taskScore,
      hoursScore,
      queryScore,
    },
    metrics: {
      tasksTotal: tasks.length,
      tasksCompleted,
      tasksInProgress,
      tasksOverdue,
      averageTaskProgress,
      weeklyHoursLogged,
      weeklyHoursTarget: targetHours,
      overtimeHours,
      queriesTotal,
      queriesResolved,
    },
  };
};
