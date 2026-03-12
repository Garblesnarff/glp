import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./app/AppShell";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { AppProviders } from "./app/providers/AppProviders";
import { AppRoutes } from "./app/routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppProviders>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </AppProviders>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
