class SkillGapService {
  calculateGap(currentSkills = [], requiredSkills = []) {
    const currentSet = new Set(currentSkills.map(s => s.toLowerCase().trim()));
    
    const missingSkills = requiredSkills.filter(
      skill => !currentSet.has(skill.toLowerCase().trim())
    );
    
    const matchedSkills = requiredSkills.filter(
      skill => currentSet.has(skill.toLowerCase().trim())
    );
    
    const matchPercentage = requiredSkills.length > 0 
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
      : 100;

    return {
      matchedSkills,
      missingSkills,
      matchPercentage,
      status: matchPercentage > 75 ? 'Advanced Match' : matchPercentage > 40 ? 'Moderate Match' : 'High Skill Gap'
    };
  }
}

module.exports = new SkillGapService();