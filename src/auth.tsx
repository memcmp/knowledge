import { UserSession, showConnect, UserData } from "@stacks/connect";

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

export async function signInUser(
  userSession: UserSession
): Promise<UserData | null> {
  if (!userSession.isUserSignedIn && userSession.isSignInPending()) {
    await userSession.handlePendingSignIn();
    window.history.replaceState({}, document.title, "/");
  }
  if (!userSession.isUserSignedIn()) {
    authenticate();
    return null;
  }
  return userSession.loadUserData();
}
