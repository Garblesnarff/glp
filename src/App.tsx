import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./app/AppShell";
import { AuthGate } from "./app/auth/AuthGate";
import { AppProviders } from "./app/providers/AppProviders";
import { AppRoutes } from "./app/routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AuthGate>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </AuthGate>
      </AppProviders>
    </BrowserRouter>
  );
}
