import React, { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import { initializeAuth, logoutUser } from './store/slices/authSlice';

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Onboarding = lazy(() => import('./pages/auth/Onboarding'));

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const PublicCourses = lazy(() => import('./pages/public/Courses'));
const PublicCourseDetails = lazy(() => import('./pages/public/CourseDetails'));
const Legal = lazy(() => import('./pages/public/Legal'));

// Learner Pages
const Dashboard = lazy(() => import('./pages/learner/Dashboard'));
const LearningPath = lazy(() => import('./pages/learner/LearningPath'));
const SkillGap = lazy(() => import('./pages/learner/SkillGap'));
const Courses = lazy(() => import('./pages/learner/Courses'));
const CourseDetails = lazy(() => import('./pages/learner/CourseDetails'));
const AIAssistant = lazy(() => import('./pages/learner/AIAssistant'));
const Profile = lazy(() => import('./pages/learner/Profile'));
const Settings = lazy(() => import('./pages/learner/Settings'));
const Goal = lazy(() => import('./pages/learner/Goal'));
const Progress = lazy(() => import('./pages/learner/Progress'));
const Assessments = lazy(() => import('./components/learning/Assessments'));
const MyLearning = lazy(() => import('./pages/learner/MyLearning'));
const Recommendations = lazy(() => import('./pages/learner/Recommendations'));
const Resources = lazy(() => import('./pages/learner/Resources'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const AdminSkills = lazy(() => import('./pages/admin/Skills'));
const AdminResources = lazy(() => import('./pages/admin/Resources'));
const AdminUsers = lazy(() => import('./pages/admin/User'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));

// Common
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: 40, 
        height: 40, 
        border: '3px solid #DCFCE7', 
        borderTopColor: '#16A34A', 
        borderRadius: '50%', 
        animation: 'spin 0.8s linear infinite', 
        margin: '0 auto 16px' 
      }} />
      <p style={{ color: '#64748B', fontSize: 14 }}>Loading CodexCrue...</p>
    </div>
  </div>
);

const CourseDetailsRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <CourseDetails /> : <PublicCourseDetails />;
};

const App = () => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
  useEffect(() => {
    dispatch(initializeAuth());
    const handleSignedOut = () => {
      dispatch(logoutUser());
    };
    window.addEventListener('firebase:signed-out', handleSignedOut);
    return () => window.removeEventListener('firebase:signed-out', handleSignedOut);
  }, [dispatch]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <AppErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Legal type="privacy" />} />
            <Route path="/terms" element={<Legal type="terms" />} />
            <Route path="/courses" element={<PublicCourses />} />
            <Route path="/courses/:id" element={<CourseDetailsRoute />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Learner Routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/learning-path" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
            <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/goal" element={<ProtectedRoute><Goal /></ProtectedRoute>} />
            <Route path="/my-goal" element={<ProtectedRoute><Goal /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
            <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
            <Route path="/admin/skills" element={<AdminRoute><AdminSkills /></AdminRoute>} />
            <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AppErrorBoundary>
  );
};

export default App;
