personalized-learning-path/
│
├── README.md
├── .gitignore
├── docker-compose.yml
├── package.json
│
├── docs/
│   ├── project-overview.md
│   ├── requirements.md
│   ├── HLD.md
│   ├── LLD.md
│   ├── ER-diagram.png
│   ├── architecture.png
│   ├── recommendation-flow.png
│   └── api-documentation.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── assets/
│       │   ├── images/
│       │   ├── icons/
│       │   └── illustrations/
│       │
│       ├── components/
│       │   │
│       │   ├── common/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Loader.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Button.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   │
│       │   ├── dashboard/
│       │   │   ├── ProgressCard.jsx
│       │   │   ├── SkillCard.jsx
│       │   │   ├── RecommendationCard.jsx
│       │   │   ├── LearningPathCard.jsx
│       │   │   └── StatsCard.jsx
│       │   │
│       │   ├── ai/
│       │   │   ├── ChatWindow.jsx
│       │   │   ├── ChatMessage.jsx
│       │   │   ├── ChatInput.jsx
│       │   │   ├── RecommendationExplanation.jsx
│       │   │   └── GoalInput.jsx
│       │   │
│       │   ├── learning/
│       │   │   ├── CourseCard.jsx
│       │   │   ├── CourseList.jsx
│       │   │   ├── LearningPath.jsx
│       │   │   ├── Milestone.jsx
│       │   │   ├── SkillGapChart.jsx
│       │   │   └── PrerequisiteGraph.jsx
│       │   │
│       │   ├── assessment/
│       │   │   ├── QuizCard.jsx
│       │   │   ├── Question.jsx
│       │   │   ├── Result.jsx
│       │   │   └── ProgressBar.jsx
│       │   │
│       │   └── admin/
│       │       ├── UserTable.jsx
│       │       ├── CourseTable.jsx
│       │       ├── SkillManager.jsx
│       │       ├── AnalyticsChart.jsx
│       │       └── RecommendationAnalytics.jsx
│       │
│       ├── pages/
│       │   │
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   └── ForgotPassword.jsx
│       │   │
│       │   ├── learner/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Goal.jsx
│       │   │   ├── SkillGap.jsx
│       │   │   ├── LearningPath.jsx
│       │   │   ├── Courses.jsx
│       │   │   ├── CourseDetails.jsx
│       │   │   ├── Assessments.jsx
│       │   │   ├── Progress.jsx
│       │   │   └── AIAssistant.jsx
│       │   │
│       │   └── admin/
│       │       ├── Dashboard.jsx
│       │       ├── Users.jsx
│       │       ├── Courses.jsx
│       │       ├── Skills.jsx
│       │       ├── LearningPaths.jsx
│       │       ├── Recommendations.jsx
│       │       ├── Assessments.jsx
│       │       └── Analytics.jsx
│       │
│       ├── services/
│       │   ├── api.js
│       │   ├── auth.service.js
│       │   ├── user.service.js
│       │   ├── course.service.js
│       │   ├── recommendation.service.js
│       │   ├── learningPath.service.js
│       │   ├── assessment.service.js
│       │   └── ai.service.js
│       │
│       ├── store/
│       │   ├── store.js
│       │   └── slices/
│       │       ├── authSlice.js
│       │       ├── userSlice.js
│       │       ├── courseSlice.js
│       │       ├── recommendationSlice.js
│       │       ├── learningPathSlice.js
│       │       └── aiSlice.js
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useDebounce.js
│       │   └── useRecommendations.js
│       │
│       └── utils/
│           ├── constants.js
│           ├── formatDate.js
│           └── helpers.js
│
│
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js
│   │
│   └── src/
│       ├── app.js
│       │
│       ├── config/
│       │   ├── db.js
│       │   ├── redis.js
│       │   └── ai.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   ├── Profile.js
│       │   ├── Skill.js
│       │   ├── Course.js
│       │   ├── LearningPath.js
│       │   ├── Recommendation.js
│       │   ├── Progress.js
│       │   ├── Assessment.js
│       │   ├── Feedback.js
│       │   └── ChatHistory.js
│       │
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── profile.controller.js
│       │   ├── course.controller.js
│       │   ├── recommendation.controller.js
│       │   ├── learningPath.controller.js
│       │   ├── progress.controller.js
│       │   ├── assessment.controller.js
│       │   ├── feedback.controller.js
│       │   ├── ai.controller.js
│       │   └── admin.controller.js
│       │
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── profile.service.js
│       │   ├── course.service.js
│       │   ├── recommendation.service.js
│       │   ├── learningPath.service.js
│       │   ├── skillGap.service.js
│       │   ├── progress.service.js
│       │   ├── assessment.service.js
│       │   ├── feedback.service.js
│       │   └── ai.service.js
│       │
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── profile.routes.js
│       │   ├── course.routes.js
│       │   ├── recommendation.routes.js
│       │   ├── learningPath.routes.js
│       │   ├── progress.routes.js
│       │   ├── assessment.routes.js
│       │   ├── feedback.routes.js
│       │   ├── ai.routes.js
│       │   └── admin.routes.js
│       │
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── admin.middleware.js
│       │   ├── error.middleware.js
│       │   └── validation.middleware.js
│       │
│       ├── validators/
│       │   ├── auth.validator.js
│       │   ├── profile.validator.js
│       │   ├── course.validator.js
│       │   └── recommendation.validator.js
│       │
│       ├── utils/
│       │   ├── constants.js
│       │   ├── common.js
│       │   ├── logger.js
│       │   └── response.js
│       │
│       └── jobs/
│           ├── recommendation.job.js
│           └── analytics.job.js
│
│
├── ml-service/
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── app.py
│   │
│   ├── models/
│   │   ├── recommendation_model.pkl
│   │   ├── tfidf_vectorizer.pkl
│   │   └── bm25_model.pkl
│   │
│   ├── data/
│   │   ├── train.csv
│   │   ├── test.csv
│   │   └── courses.csv
│   │
│   ├── src/
│   │   ├── preprocessing.py
│   │   ├── feature_engineering.py
│   │   ├── recommender.py
│   │   ├── similarity.py
│   │   ├── ranking.py
│   │   └── inference.py
│   │
│   └── api/
│       ├── routes.py
│       └── schemas.py
│
│
├── ai-service/
│   ├── prompts/
│   │   ├── goal_extraction.txt
│   │   ├── skill_analysis.txt
│   │   ├── recommendation_explanation.txt
│   │   └── learning_path.txt
│   │
│   ├── goal_analyzer.py
│   ├── skill_analyzer.py
│   ├── explanation.py
│   └── chatbot.py
│
│
└── scripts/
    ├── seedDatabase.js
    ├── importCourses.js
    ├── generateEmbeddings.py
    └── trainModel.py