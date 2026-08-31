class AIChatbot:
    def get_response(self, user_message: str, learner_context: dict):
        goal = learner_context.get("learningGoal", "Software Developer")
        return f"As your CortexCrew AI Mentor specialized in your journey to become a {goal}, I suggest focusing on consistent milestone completion. Regarding your question: '{user_message}', let's break it down step-by-step."

ai_chatbot = AIChatbot()