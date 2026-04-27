/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SiteProvider }    from './context/SiteContext';
import { AuthProvider }    from './context/AuthContext';
import { ProtectedRoute }  from './components/ProtectedRoute';
import { ErrorBoundary }   from './components/ErrorBoundary';

// ── Public pages ──────────────────────────────────────────────────────────────
import { HomePage }        from './pages/HomePage';
import { PressKitPage }    from './pages/PressKitPage';
import { BlogPostPage }    from './pages/BlogPostPage';

// ── Admin pages ───────────────────────────────────────────────────────────────
import { AdminLogin }         from './pages/admin/AdminLogin';
import { AdminLayout }        from './pages/admin/AdminLayout';
import { AdminDashboard }     from './pages/admin/AdminDashboard';
import { AdminHero }          from './pages/admin/AdminHero';
import { AdminBio }           from './pages/admin/AdminBio';
import { AdminStats }         from './pages/admin/AdminStats';
import { AdminAchievements }  from './pages/admin/AdminAchievements';
import { AdminGallery }       from './pages/admin/AdminGallery';
import { AdminVideos }        from './pages/admin/AdminVideos';
import { AdminEvents }        from './pages/admin/AdminEvents';
import { AdminDonate }        from './pages/admin/AdminDonate';
import { AdminSocial }        from './pages/admin/AdminSocial';
import { AdminSocialFeed }    from './pages/admin/AdminSocialFeed';
import { AdminAnalytics }     from './pages/admin/AdminAnalytics';
import { AdminPressKit }      from './pages/admin/AdminPressKit';
import { AdminSponsors }      from './pages/admin/AdminSponsors';
import { AdminBlog }          from './pages/admin/AdminBlog';
import { AdminSupporterWall } from './pages/admin/AdminSupporterWall';

import { usePageView } from './hooks/usePageView';

function AppRoutes() {
  usePageView();

  return (
    <Routes>

      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route path="/"           element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
      <Route path="/press-kit"  element={<ErrorBoundary><PressKitPage /></ErrorBoundary>} />
      <Route path="/blog/:slug" element={<ErrorBoundary><BlogPostPage /></ErrorBoundary>} />

      {/* ── Admin login ─────────────────────────────────────────────────── */}
      <Route path="/admin"       element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Protected admin area ────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>

          {/* Site */}
          <Route path="dashboard"      element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
          <Route path="hero"           element={<ErrorBoundary><AdminHero /></ErrorBoundary>} />
          <Route path="bio"            element={<ErrorBoundary><AdminBio /></ErrorBoundary>} />
          <Route path="stats"          element={<ErrorBoundary><AdminStats /></ErrorBoundary>} />
          <Route path="achievements"   element={<ErrorBoundary><AdminAchievements /></ErrorBoundary>} />

          {/* Media */}
          <Route path="gallery"        element={<ErrorBoundary><AdminGallery /></ErrorBoundary>} />
          <Route path="videos"         element={<ErrorBoundary><AdminVideos /></ErrorBoundary>} />
          <Route path="blog"           element={<ErrorBoundary><AdminBlog /></ErrorBoundary>} />
          <Route path="social-feed"    element={<ErrorBoundary><AdminSocialFeed /></ErrorBoundary>} />

          {/* Events & Community */}
          <Route path="events"         element={<ErrorBoundary><AdminEvents /></ErrorBoundary>} />
          <Route path="supporter-wall" element={<ErrorBoundary><AdminSupporterWall /></ErrorBoundary>} />
          <Route path="donate"         element={<ErrorBoundary><AdminDonate /></ErrorBoundary>} />

          {/* Presence */}
          <Route path="social"         element={<ErrorBoundary><AdminSocial /></ErrorBoundary>} />
          <Route path="analytics"      element={<ErrorBoundary><AdminAnalytics /></ErrorBoundary>} />
          <Route path="press-kit"      element={<ErrorBoundary><AdminPressKit /></ErrorBoundary>} />
          <Route path="sponsors"       element={<ErrorBoundary><AdminSponsors /></ErrorBoundary>} />

        </Route>
      </Route>

      {/* ── Catch-all ───────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
