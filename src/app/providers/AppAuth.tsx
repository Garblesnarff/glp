import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { useEffect, useMemo, type PropsWithChildren } from "react";
import { appEnv, envReadiness } from "../../config/env";
import { AppAuthContext, localAuthState, type AppAuthState } from "./app-auth-context";

export function AppAuthProvider({ children }: PropsWithChildren) {
  if (!envReadiness.authReady) {
    return <AppAuthContext.Provider value={localAuthState}>{children}</AppAuthContext.Provider>;
  }

  return (
    <AuthKitProvider
      clientId={appEnv.workos.clientId}
      apiHostname={appEnv.workos.apiHostname}
      redirectUri={appEnv.workos.redirectUri}
      onRedirectCallback={({ state }) => {
        if (state?.returnTo && typeof state.returnTo === "string") {
          window.history.replaceState({}, "", state.returnTo);
          return;
        }

        if (window.location.pathname === "/auth/callback") {
          window.history.replaceState({}, "", "/");
        }
      }}
    >
      <WorkOSAuthBridge>{children}</WorkOSAuthBridge>
    </AuthKitProvider>
  );
}

function WorkOSAuthBridge({ children }: PropsWithChildren) {
  const { user, isLoading, getAccessToken, signIn, signUp, signOut } = useAuth();

  useEffect(() => {
    if (window.location.pathname !== "/login") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const context = searchParams.get("context") ?? undefined;

    void signIn({
      context,
      state: {
        returnTo: searchParams.get("returnTo") ?? "/",
      },
    });
  }, [signIn]);

  const value = useMemo<AppAuthState>(
    () => ({
      mode: "workos",
      isConfigured: true,
      isLoading,
      user,
      getAccessToken,
      signIn: async () => {
        await signIn({
          state: {
            returnTo: `${window.location.pathname}${window.location.search}`,
          },
        });
      },
      signUp: async () => {
        await signUp({
          state: {
            returnTo: `${window.location.pathname}${window.location.search}`,
          },
        });
      },
      signOut: async () => {
        await signOut();
      },
    }),
    [getAccessToken, isLoading, signIn, signOut, signUp, user],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}
