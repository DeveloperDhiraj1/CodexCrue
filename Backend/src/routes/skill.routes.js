const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const protect = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { validateSkillPayload, validateSkillUpdate } = require('../validators/skill.validator');

router.get('/', skillController.getSkills);
router.get('/:id', skillController.getSkill);
router.post('/', protect, adminOnly, validateSkillPayload, skillController.createSkill);
router.put('/:id', protect, adminOnly, validateSkillUpdate, skillController.updateSkill);
router.delete('/:id', protect, adminOnly, skillController.deleteSkill);

module.exports = router;
