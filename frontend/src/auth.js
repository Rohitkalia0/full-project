export const setToken = (token) => localStorage.setItem("access_token", token);
export const getToken = () => localStorage.getItem("access_token");
export const isAuthenticated = () => !!localStorage.getItem("access_token");

export const logout = () => {
  // Clear all user-related data from localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("first_name");
  localStorage.removeItem("last_name");
  localStorage.removeItem("photo_url");
  localStorage.removeItem("user_email");
  window.location.href = "/login";
};