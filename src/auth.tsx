import { AppConfig, UserSession, showConnect } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

export function authenticate() {
  showConnect({
    appDetails: {
      name: "Knowledge",
      icon: window.location.origin + "/logo.svg"
    },
    redirectTo: "/",
    finished: () => {
      window.location.reload();
    }
  });
}

export function getUserData() {
  return userSession.loadUserData();
}
