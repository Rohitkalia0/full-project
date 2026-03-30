import { logoutAPI } from "./api";

export const isAuthenticated = () => !!localStorage.getItem("is_logged_in");

export const logout = async () => {
  try {
    await logoutAPI();
  } catch {
    // ignore — still clear local state
  }
  localStorage.removeItem("is_logged_in");
  sessionStorage.clear();
  window.location.href = "/login";
};
