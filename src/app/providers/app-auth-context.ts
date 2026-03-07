import { createContext, useContext } from "react";
import type { User } from "@workos-inc/authkit-js";

export type AppAuthState = {
  mode: "local" | "workos";
  isConfigured: boolean;
  isLoading: boolean;
  user: User | null;
  getAccessToken: () => Promise<string | null>;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const localAuthState: AppAuthState = {
  mode: "local",
  isConfigured: false,
  isLoading: false,
  user: null,
  getAccessToken: async () => null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

export const AppAuthContext = createContext<AppAuthState>(localAuthState);

export function useAppAuth() {
  return useContext(AppAuthContext);
}
