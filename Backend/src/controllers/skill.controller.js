const skillService = require('../services/skill.service');
const sendResponse = require('../utils/response');

class SkillController {
  async getSkills(req, res, next) {
    try {
      const result = await skillService.getSkills(req.query);
      return sendResponse(res, 200, true, 'Skills retrieved successfully', result.items, result.pagination);
    } catch (error) { next(error); }
  }

  async getSkill(req, res, next) {
    try { return sendResponse(res, 200, true, 'Skill retrieved successfully', await skillService.getSkillById(req.params.id)); }
    catch (error) { next(error); }
  }

  async createSkill(req, res, next) {
    try { return sendResponse(res, 201, true, 'Skill created successfully', await skillService.createSkill(req.body)); }
    catch (error) { next(error); }
  }

  async updateSkill(req, res, next) {
    try { return sendResponse(res, 200, true, 'Skill updated successfully', await skillService.updateSkill(req.params.id, req.body)); }
    catch (error) { next(error); }
  }

  async deleteSkill(req, res, next) {
    try { return sendResponse(res, 200, true, 'Skill deleted successfully', await skillService.deleteSkill(req.params.id)); }
    catch (error) { next(error); }
  }
}

module.exports = new SkillController();
