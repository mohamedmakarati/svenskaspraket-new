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
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminVerbsPage = lazy(() => import('@/pages/admin/AdminVerbsPage'));
const AdminVocabularyPage = lazy(() => import('@/pages/admin/AdminVocabularyPage'));
const AdminLessonsPage = lazy(() => import('@/pages/admin/AdminLessonsPage'));
const AdminQuizPage = lazy(() => import('@/pages/admin/AdminQuizPage'));
const AdminMediaPage = lazy(() => import('@/pages/admin/AdminMediaPage'));

function Loading() {
  return (
    <div className="wrap section" style={{ textAlign: 'center' }}>
      <p>Laddar…</p>
    </div>
  );
}

/** Legacy .html URL redirects */
function LegacyRedirect({ to }) {
  return <Navigate to={to} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/en" element={<EnglishHomePage />} />
              <Route path="/ar" element={<ArabicHomePage />} />
              <Route path="/verbs" element={<VerbsPage level="A1" />} />
              <Route path="/verbs-a2" element={<VerbsPage level="A2" />} />
              <Route path="/verbs-b1b2" element={<VerbsPage level="B1-B2" />} />
              <Route path="/vocabulary" element={<VocabularyPage />} />
              <Route path="/lessons-a1" element={<LessonsA1Page />} />
              <Route path="/lessons" element={<LessonsB1Page />} />

              {/* Legacy .html redirects */}
              <Route path="/verbs.html" element={<LegacyRedirect to="/verbs" />} />
              <Route path="/verbs-a2.html" element={<LegacyRedirect to="/verbs-a2" />} />
              <Route path="/verbs-b1b2.html" element={<LegacyRedirect to="/verbs-b1b2" />} />
              <Route path="/vocabulary.html" element={<LegacyRedirect to="/vocabulary" />} />
              <Route path="/lessons-a1.html" element={<LegacyRedirect to="/lessons-a1" />} />
              <Route path="/lessons.html" element={<LegacyRedirect to="/lessons" />} />
              <Route path="/en/" element={<LegacyRedirect to="/en" />} />
              <Route path="/ar/" element={<LegacyRedirect to="/ar" />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="verbs" element={<AdminVerbsPage />} />
                <Route path="vocabulary" element={<AdminVocabularyPage />} />
                <Route path="lessons" element={<AdminLessonsPage />} />
                <Route path="quiz" element={<AdminQuizPage />} />
                <Route path="media" element={<AdminMediaPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
    </AuthProvider>
  );
}
