const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const protect = require('../middleware/auth.middleware');
const { validateGoal, validateGoalUpdate } = require('../validators/goal.validator');

router.use(protect);
router.get('/', goalController.getGoal);
router.post('/', validateGoal, goalController.createGoal);
router.put('/', validateGoalUpdate, goalController.updateGoal);
router.delete('/', goalController.deleteGoal);

module.exports = router;
