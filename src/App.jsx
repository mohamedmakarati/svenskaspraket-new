import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const EnglishHomePage = lazy(() => import('@/pages/EnglishHomePage'));
const ArabicHomePage = lazy(() => import('@/pages/ArabicHomePage'));
const VerbsPage = lazy(() => import('@/pages/VerbsPage'));
const VocabularyPage = lazy(() => import('@/pages/VocabularyPage'));
const LessonsA1Page = lazy(() => import('@/pages/LessonsA1Page'));
const LessonsB1Page = lazy(() => import('@/pages/LessonsB1Page'));
const C1Page = lazy(() => import('@/pages/C1Page'));
const LessonB2C1Page = lazy(() => import('@/pages/LessonB2C1Page'));
const LessonA2B1GrammarPage = lazy(() => import('@/pages/LessonA2B1GrammarPage'));
const LundLevelPage = lazy(() => import('@/pages/LundLevelPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminAuthCallbackPage = lazy(() => import('@/pages/admin/AdminAuthCallbackPage'));
const AdminForgotPasswordPage = lazy(() => import('@/pages/admin/AdminForgotPasswordPage'));
const AdminResetPasswordPage = lazy(() => import('@/pages/admin/AdminResetPasswordPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminVerbsListPage = lazy(() => import('@/pages/admin/AdminVerbsListPage'));
const AdminVerbFormPage = lazy(() => import('@/pages/admin/AdminVerbFormPage'));
const AdminVocabularyListPage = lazy(() => import('@/pages/admin/AdminVocabularyListPage'));
const AdminVocabularyFormPage = lazy(() => import('@/pages/admin/AdminVocabularyFormPage'));
const AdminLessonsListPage = lazy(() => import('@/pages/admin/AdminLessonsListPage'));
const AdminLessonFormPage = lazy(() => import('@/pages/admin/AdminLessonFormPage'));
const AdminQuizzesPage = lazy(() => import('@/pages/admin/AdminQuizzesPage'));
const AdminMediaPage = lazy(() => import('@/pages/admin/AdminMediaPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

function Loading() {
  return (
    <div className="wrap section" style={{ textAlign: 'center' }}>
      <p>Laddar…</p>
    </div>
  );
}

function LegacyRedirect({ to }) {
  return <Navigate to={to} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/en" element={<EnglishHomePage />} />
            <Route path="/ar" element={<ArabicHomePage />} />
            <Route path="/verbs" element={<VerbsPage level="A1" />} />
            <Route path="/verbs-a2" element={<VerbsPage level="A2" />} />
            <Route path="/verbs-b1b2" element={<VerbsPage level="B1-B2" />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/lessons-a1" element={<LessonsA1Page />} />
            <Route path="/lessons" element={<LessonsB1Page />} />
            <Route path="/c1" element={<C1Page />} />
            <Route path="/lessons-b2c1" element={<LessonB2C1Page />} />
            <Route path="/lessons-a2-b1" element={<LessonA2B1GrammarPage />} />
            <Route path="/niva/:levelId" element={<LundLevelPage />} />

            <Route path="/verbs.html" element={<LegacyRedirect to="/verbs" />} />
            <Route path="/verbs-a2.html" element={<LegacyRedirect to="/verbs-a2" />} />
            <Route path="/verbs-b1b2.html" element={<LegacyRedirect to="/verbs-b1b2" />} />
            <Route path="/vocabulary.html" element={<LegacyRedirect to="/vocabulary" />} />
            <Route path="/lessons-a1.html" element={<LegacyRedirect to="/lessons-a1" />} />
            <Route path="/lessons.html" element={<LegacyRedirect to="/lessons" />} />
            <Route path="/en/" element={<LegacyRedirect to="/en" />} />
            <Route path="/ar/" element={<LegacyRedirect to="/ar" />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/auth/callback" element={<AdminAuthCallbackPage />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
            <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="verbs" element={<AdminVerbsListPage />} />
              <Route path="verbs/new" element={<AdminVerbFormPage />} />
              <Route path="verbs/:id/edit" element={<AdminVerbFormPage />} />
              <Route path="vocabulary" element={<AdminVocabularyListPage />} />
              <Route path="vocabulary/new" element={<AdminVocabularyFormPage />} />
              <Route path="vocabulary/:id/edit" element={<AdminVocabularyFormPage />} />
              <Route path="lessons" element={<AdminLessonsListPage />} />
              <Route path="lessons/new" element={<AdminLessonFormPage />} />
              <Route path="lessons/:id/edit" element={<AdminLessonFormPage />} />
              <Route path="quizzes" element={<AdminQuizzesPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="quiz" element={<LegacyRedirect to="/admin/quizzes" />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
