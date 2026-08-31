function courseId(course) {
  return String(course?._id || course);
}

function prerequisiteIds(course) {
  return (course.prerequisites || []).map((prerequisite) => courseId(prerequisite));
}

function topologicalSortCourses(courses) {
  const byId = new Map(courses.map((course) => [courseId(course), course]));
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];

  function visit(id) {
    if (visiting.has(id)) throw Object.assign(new Error('Cannot generate a learning path from cyclic course prerequisites.'), { statusCode: 400 });
    if (visited.has(id)) return;
    const course = byId.get(id);
    if (!course) throw Object.assign(new Error(`Course prerequisite ${id} is unavailable.`), { statusCode: 400 });
    visiting.add(id);
    prerequisiteIds(course).forEach(visit);
    visiting.delete(id);
    visited.add(id);
    ordered.push(course);
  }

  courses.forEach((course) => visit(courseId(course)));
  return ordered;
}

function parseDurationHours(duration, availableHoursPerDay = 2) {
  const value = String(duration || '').toLowerCase();
  const hours = value.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hours) return Number(hours[1]);
  const weeks = value.match(/(\d+(?:\.\d+)?)\s*week/);
  if (weeks) return Number(weeks[1]) * Math.max(1, availableHoursPerDay) * 7;
  const days = value.match(/(\d+(?:\.\d+)?)\s*day/);
  if (days) return Number(days[1]) * Math.max(1, availableHoursPerDay);
  return 4;
}

function estimateDuration(courses, availableHoursPerDay = 2) {
  const weeklyHours = Math.max(1, Number(availableHoursPerDay) * 7);
  const totalHours = courses.reduce((sum, course) => sum + parseDurationHours(course.duration, availableHoursPerDay), 0);
  return `${Math.max(1, Math.ceil(totalHours / weeklyHours))} weeks`;
}

function milestoneStatus(courseList, progressByCourse, completedCourseIds, previousCompleted) {
  const completed = new Set(completedCourseIds.map(String));
  const progressValues = courseList.map((course) => {
    const id = courseId(course);
    if (completed.has(id)) return 100;
    return Math.max(0, Math.min(100, Number(progressByCourse[id]?.completionPercentage || 0)));
  });
  const progress = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;
  if (progress === 100) return { status: 'completed', progress };
  if (previousCompleted) return { status: 'in_progress', progress };
  return { status: 'locked', progress };
}

function buildMilestones(orderedCourses, progressByCourse = {}, completedCourseIds = [], availableHoursPerDay = 2, chunkSize = 2) {
  const milestones = [];
  for (let index = 0; index < orderedCourses.length; index += chunkSize) {
    const courseList = orderedCourses.slice(index, index + chunkSize);
    const previous = milestones[milestones.length - 1];
    const previousCompleted = !previous || previous.status === 'completed';
    const state = milestoneStatus(courseList, progressByCourse, completedCourseIds, previousCompleted);
    const prerequisitePhases = [...new Set(courseList.flatMap((course) => prerequisiteIds(course)
      .map((prerequisiteId) => orderedCourses.findIndex((item) => courseId(item) === prerequisiteId))
      .filter((phaseIndex) => phaseIndex >= 0)
      .map((phaseIndex) => Math.floor(phaseIndex / chunkSize) + 1)
      .filter((phase) => phase < milestones.length + 1)))];
    milestones.push({
      milestoneId: `phase-${milestones.length + 1}`,
      phase: milestones.length + 1,
      title: courseList.map((course) => course.title).join(' + '),
      description: `Build capability through ${courseList.map((course) => course.title).join(' and ')}.`,
      courses: courseList.map((course) => course._id),
      skills: [...new Set(courseList.flatMap((course) => course.skills || []))],
      learningObjectives: [...new Set(courseList.flatMap((course) => (course.skills || []).slice(0, 4).map((skill) => 'Apply ' + skill + ' in a practical task.')))],
      activities: courseList.flatMap((course) => {
        const skills = (course.skills || []).slice(0, 3).join(', ');
        return [
          { type: 'lesson', courseId: course._id, title: 'Learn: ' + course.title, description: course.description, estimatedMinutes: 60, url: course.sourceUrl },
          { type: 'assignment', courseId: course._id, title: 'Assignment: practice ' + (skills || 'the core concepts'), description: 'Write down the key ideas, solve one small problem, and save your work as evidence.', estimatedMinutes: 45 },
          { type: 'project', courseId: course._id, title: 'Build: ' + course.title + ' mini project', description: 'Create a small portfolio-ready project using ' + (skills || 'the skills from this course') + '.', estimatedMinutes: 120 },
          { type: 'assessment', courseId: course._id, title: 'Checkpoint: explain what you learned', description: 'Test yourself without notes and revisit any topic you cannot explain clearly.', estimatedMinutes: 20 }
        ];
      }),
      prerequisitePhases,
      estimatedDuration: estimateDuration(courseList, availableHoursPerDay),
      progress: state.progress,
      status: state.status
    });
  }
  const firstIncomplete = milestones.findIndex((milestone) => milestone.status !== 'completed');
  return milestones.map((milestone, index) => ({
    ...milestone,
    status: milestone.status === 'completed' ? 'completed' : index === firstIncomplete ? 'in_progress' : 'locked'
  }));
}

module.exports = { courseId, prerequisiteIds, topologicalSortCourses, parseDurationHours, estimateDuration, buildMilestones };
