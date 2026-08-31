const goalService = require('../services/goal.service');
const sendResponse = require('../utils/response');
const personalizationService = require('../services/personalization.service');

class GoalController {
  async getGoal(req, res, next) {
    try { return sendResponse(res, 200, true, 'Goal retrieved successfully', await goalService.getGoal(req.user.id)); }
    catch (error) { next(error); }
  }

  async createGoal(req, res, next) {
    try { const goal = await goalService.createGoal(req.user.id, req.body); await personalizationService.regenerateForUser(req.user.id); return sendResponse(res, 201, true, 'Goal created successfully', goal); }
    catch (error) { next(error); }
  }

  async updateGoal(req, res, next) {
    try { const goal = await goalService.updateGoal(req.user.id, req.body); await personalizationService.regenerateForUser(req.user.id); return sendResponse(res, 200, true, 'Goal updated successfully', goal); }
    catch (error) { next(error); }
  }

  async deleteGoal(req, res, next) {
    try { return sendResponse(res, 200, true, 'Goal deleted successfully', await goalService.deleteGoal(req.user.id)); }
    catch (error) { next(error); }
  }
}

module.exports = new GoalController();
