import { Navigate, Route, Routes } from "react-router-dom";
import { AuthStatusPage } from "./AuthStatusPage";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { GLP1MealPlanner } from "../../features/meal-planner/GLP1MealPlanner";
import { OnboardingPage } from "../../features/onboarding/OnboardingPage";

export function AppRoutes() {
  return (
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
  );
}
