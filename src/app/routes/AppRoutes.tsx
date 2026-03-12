import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { font, palette, sans } from "../../features/meal-planner/constants";

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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/today" element={<DailyLogPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/medication" element={<MedicationTimelinePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/partner" element={<PartnerWorkspacePage />} />
        <Route path="/social-eating" element={<SocialEatingPage />} />
        <Route path="/weight" element={<WeightPage />} />
        <Route path="/planner" element={<GLP1MealPlanner initialTab="planner" />} />
        <Route path="/grocery" element={<GLP1MealPlanner initialTab="grocery" />} />
        <Route path="/tracker" element={<GLP1MealPlanner initialTab="tracker" />} />
        <Route path="/recipes" element={<GLP1MealPlanner initialTab="recipes" />} />
        <Route path="/food-diary" element={<FoodDiaryPage />} />
        <Route path="/red-flags" element={<RedFlagPage />} />
        <Route
          path="/login"
          element={<AuthStatusPage title="Starting sign-in" body="Redirecting to WorkOS so your session can be established." />}
        />
        <Route
          path="/auth/callback"
          element={<AuthStatusPage title="Finishing sign-in" body="Completing the WorkOS callback and returning you to the app." />}
        />
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
