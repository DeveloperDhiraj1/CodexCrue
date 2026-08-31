const User = require('../models/User');
const sendResponse = require('../utils/response');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().select('-password');
      return sendResponse(res, 200, true, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      if (!['active', 'inactive', 'banned'].includes(req.body.status)) return sendResponse(res, 400, false, 'Status must be active, inactive, or banned.', null);
      if (String(req.user.id) === String(req.params.id)) return sendResponse(res, 400, false, 'You cannot deactivate your own admin account.', null);
      const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status, isActive: req.body.status === 'active' }, { new: true, runValidators: true }).select('name email role isActive status');
      if (!user) return sendResponse(res, 404, false, 'User not found.', null);
      return sendResponse(res, 200, true, `User ${req.body.status} successfully.`, user);
    } catch (error) { next(error); }
  }
}

module.exports = new UserController();
