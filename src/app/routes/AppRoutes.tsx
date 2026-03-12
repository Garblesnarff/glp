import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { font, palette, sans } from "../../lib/design-tokens";
import { ProtectedRoute } from "../auth/ProtectedRoute";

const LandingPage = lazy(() =>
  import("../../features/landing/LandingPage").then((module) => ({ default: module.LandingPage })),
);
const AuthStatusPage = lazy(() =>
  import("./AuthStatusPage").then((module) => ({ default: module.AuthStatusPage })),
);
const DashboardPage = lazy(() =>
  import("../../features/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const DailyLogPage = lazy(() =>
  import("../../features/daily-log/DailyLogPage").then((module) => ({ default: module.DailyLogPage })),
);
const HistoryPage = lazy(() =>
  import("../../features/history/HistoryPage").then((module) => ({ default: module.HistoryPage })),
);
const GLP1MealPlanner = lazy(() =>
  import("../../features/meal-planner/GLP1MealPlanner").then((module) => ({ default: module.GLP1MealPlanner })),
);
const OnboardingPage = lazy(() =>
  import("../../features/onboarding/OnboardingPage").then((module) => ({ default: module.OnboardingPage })),
);
const MedicationTimelinePage = lazy(() =>
  import("../../features/medication/MedicationTimelinePage").then((module) => ({ default: module.MedicationTimelinePage })),
);
const NotificationsPage = lazy(() =>
  import("../../features/notifications/NotificationsPage").then((module) => ({ default: module.NotificationsPage })),
);
const PartnerWorkspacePage = lazy(() =>
  import("../../features/partner/PartnerWorkspacePage").then((module) => ({ default: module.PartnerWorkspacePage })),
);
const SocialEatingPage = lazy(() =>
  import("../../features/social-eating/SocialEatingPage").then((module) => ({ default: module.SocialEatingPage })),
);
const WeightPage = lazy(() =>
  import("../../features/weight/WeightPage").then((module) => ({ default: module.WeightPage })),
);
const RedFlagPage = lazy(() =>
  import("../../features/safety/RedFlagPage").then((module) => ({ default: module.RedFlagPage })),
);
const FoodDiaryPage = lazy(() =>
  import("../../features/food-diary/FoodDiaryPage").then((module) => ({ default: module.FoodDiaryPage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={<AuthStatusPage title="Starting sign-in" body="Redirecting to WorkOS so your session can be established." />}
        />
        <Route
          path="/auth/callback"
          element={<AuthStatusPage title="Finishing sign-in" body="Completing the WorkOS callback and returning you to the app." />}
        />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/today" element={<ProtectedRoute><DailyLogPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/medication" element={<ProtectedRoute><MedicationTimelinePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/partner" element={<ProtectedRoute><PartnerWorkspacePage /></ProtectedRoute>} />
        <Route path="/social-eating" element={<ProtectedRoute><SocialEatingPage /></ProtectedRoute>} />
        <Route path="/weight" element={<ProtectedRoute><WeightPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><GLP1MealPlanner initialTab="planner" /></ProtectedRoute>} />
        <Route path="/grocery" element={<ProtectedRoute><GLP1MealPlanner initialTab="grocery" /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><GLP1MealPlanner initialTab="tracker" /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><GLP1MealPlanner initialTab="recipes" /></ProtectedRoute>} />
        <Route path="/food-diary" element={<ProtectedRoute><FoodDiaryPage /></ProtectedRoute>} />
        <Route path="/red-flags" element={<ProtectedRoute><RedFlagPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function RouteLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: palette.bg,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontFamily: font, fontSize: 32, marginBottom: 8, color: palette.text }}>Loading</div>
        <div style={{ fontFamily: sans, color: palette.textMuted, lineHeight: 1.6 }}>
          Fetching the next section of your companion app.
        </div>
      </div>
    </div>
  );
}
