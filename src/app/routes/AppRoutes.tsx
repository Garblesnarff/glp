import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { font, palette, sans } from "../../features/meal-planner/constants";

const AuthStatusPage = lazy(() =>
  import("./AuthStatusPage").then((module) => ({ default: module.AuthStatusPage })),
);
const DashboardPage = lazy(() =>
  import("../../features/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const GLP1MealPlanner = lazy(() =>
  import("../../features/meal-planner/GLP1MealPlanner").then((module) => ({ default: module.GLP1MealPlanner })),
);
const OnboardingPage = lazy(() =>
  import("../../features/onboarding/OnboardingPage").then((module) => ({ default: module.OnboardingPage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/planner" element={<GLP1MealPlanner initialTab="planner" />} />
        <Route path="/grocery" element={<GLP1MealPlanner initialTab="grocery" />} />
        <Route path="/tracker" element={<GLP1MealPlanner initialTab="tracker" />} />
        <Route path="/recipes" element={<GLP1MealPlanner initialTab="recipes" />} />
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
