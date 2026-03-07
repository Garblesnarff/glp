import { appEnv } from "../../config/env";

export function getWorkOSBrowserConfig() {
  return {
    clientId: appEnv.workos.clientId,
    redirectUri: appEnv.workos.redirectUri,
    isConfigured: Boolean(appEnv.workos.clientId && appEnv.workos.redirectUri),
  };
}
