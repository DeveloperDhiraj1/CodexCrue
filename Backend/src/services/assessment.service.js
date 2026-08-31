const Assessment = require('../models/Assessment');
const LearningPath = require('../models/LearningPath');
const Progress = require('../models/Progress');
const AssessmentAttempt = require('../models/AssessmentAttempt');

class AssessmentService {
  async listAssessments() {
    return Assessment.find({}).select('title courseId milestonePhase passingScore questions.questionText questions.options').populate('courseId', 'title').lean();
  }

  async getAssessmentById(id) {
    return Assessment.findById(id).select('-questions.correctAnswer').populate('courseId', 'status');
  }

  async evaluateAssessment(userId, assessmentId, answers) {
    if (!Array.isArray(answers) || answers.some((answer) => typeof answer !== 'string' || answer.length > 500)) {
      throw Object.assign(new Error('Answers must be provided as an array.'), { statusCode: 400 });
    }

    const assessment = await Assessment.findById(assessmentId).select('+questions.correctAnswer');
    if (!assessment) {
      throw Object.assign(new Error('Assessment not found'), { statusCode: 404 });
    }

    if (assessment.questions.length === 0 || answers.length !== assessment.questions.length) {
      throw Object.assign(new Error('A response is required for every assessment question.'), { statusCode: 400 });
    }

    let correctCount = 0;
    assessment.questions.forEach((q, index) => {
      if (q.correctAnswer === answers[index]) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = score >= assessment.passingScore;

    // Passing unlocks the next milestone once; repeated attempts do not inflate progress.
    if (passed && assessment.milestonePhase) {
      const path = await LearningPath.findOne({ userId });
      if (path) {
        let changed = false;
        path.milestones.forEach((m) => {
          if (m.phase === assessment.milestonePhase && m.status !== 'completed') {
            m.status = 'completed';
            m.progress = 100;
            changed = true;
          }
          if (m.phase === assessment.milestonePhase + 1 && m.status === 'locked') {
            m.status = 'available'; // Unlock next phase
            changed = true;
          }
        });
        if (changed) {
          const completedMilestones = path.milestones.filter((milestone) => milestone.status === 'completed').length;
          path.overallProgress = path.milestones.length ? Math.round((completedMilestones / path.milestones.length) * 100) : path.overallProgress;
          await path.save();
        }
      }
    }

    const attempt = await AssessmentAttempt.create({
      userId,
      assessmentId,
      answers,
      score,
      passed,
      passingScore: assessment.passingScore
    });

    return {
      attemptId: attempt._id,
      score,
      passed,
      passingScore: assessment.passingScore
    };
  }
}

module.exports = new AssessmentService();
