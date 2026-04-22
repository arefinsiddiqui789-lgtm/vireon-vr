export const LOGIN_EVENT = "vireon:login-success";

export function signalJustLoggedIn() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOGIN_EVENT));
  }
}
