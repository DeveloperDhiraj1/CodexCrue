class GoalAnalyzer:
    def extract_goal(self, user_text: str):
        # Abstraction layer for parsing goal via LLM API
        return {
            "goal": user_text,
            "careerGoal": user_text,
            "estimatedDuration": "6 months"
        }

goal_analyzer = GoalAnalyzer()