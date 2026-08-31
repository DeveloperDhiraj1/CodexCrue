const rewardService = require('../services/reward.service');
const sendResponse = require('../utils/response');

exports.list = async (req, res, next) => {
  try { return sendResponse(res, 200, true, 'Rewards retrieved successfully.', await rewardService.listForUser(req.user.id)); }
  catch (error) { return next(error); }
};

exports.badges = async (req, res, next) => {
  try { return sendResponse(res, 200, true, 'Badges retrieved successfully.', await rewardService.listBadges(req.user.id)); }
  catch (error) { return next(error); }
};
