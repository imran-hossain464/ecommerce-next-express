export function getAuthTokenCookie() {
  if (typeof document === "undefined") return "";

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("app-auth-token="))
      ?.split("=")[1] ?? ""
  );
}

export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("app-auth-changed"));
}
