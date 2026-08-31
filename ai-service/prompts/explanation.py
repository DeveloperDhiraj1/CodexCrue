class ExplanationGenerator:
    def explain(self, course_title: str, goal: str, skills: list):
        return f"'{course_title}' is recommended because it bridges your missing prerequisite skills while aligning directly with your objective to become a {goal}."

explanation_generator = ExplanationGenerator()