const BASE_URL = "https://full-project-9w4o.onrender.com/api/v1";

const getToken = () => localStorage.getItem("access_token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    console.error("API ERROR:", data);
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// ================= TOKEN REFRESH =================

let refreshPromise = null;

const refreshTokens = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  const tokens = data?.data ?? data;
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  return tokens.access_token;
};

// Deduplicated refresh — if multiple 401s fire at once, only one refresh call is made
const ensureFreshToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

// Wrapper for authenticated fetch — retries once on 401 after refreshing tokens
const authFetch = async (url, options = {}) => {
  let res = await fetch(url, options);

  if (res.status === 401) {
    try {
      const newToken = await ensureFreshToken();
      // Rebuild headers with new token
      const retryOptions = { ...options };
      if (retryOptions.headers instanceof Headers) {
        retryOptions.headers.set("Authorization", `Bearer ${newToken}`);
      } else if (retryOptions.headers) {
        retryOptions.headers = { ...retryOptions.headers, Authorization: `Bearer ${newToken}` };
      }
      res = await fetch(url, retryOptions);
    } catch {
      // Refresh failed — force logout
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("first_name");
      localStorage.removeItem("last_name");
      localStorage.removeItem("photo_url");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  return res;
};

// ================= AUTH =================

export const signupAPI = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const loginAPI = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ================= USER =================

export const updateUserAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/users`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const uploadPhotoAPI = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await authFetch(`${BASE_URL}/users/profile-picture`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });
  return handleResponse(res);
};

export const getUserAPI = async () => {
  const res = await authFetch(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: getHeaders()
  });
  return handleResponse(res);
};

// ================= SETTINGS =================

export const createSettingAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/settings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getSettingAPI = async () => {
  const res = await authFetch(`${BASE_URL}/settings`, {
    method: "GET",
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const updateSettingAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/settings`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};
export const removePhotoAPI = async () => {
  const res = await authFetch(`${BASE_URL}/users/profile-picture`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return handleResponse(res);
};

// ================= MORNING =================

export const createMorningAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/morning`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getMorningAPI = async (date) => {
  const res = await authFetch(`${BASE_URL}/morning/${date}`, {
    method: "GET",
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const updateMorningAPI = async (checkinId, payload) => {
  const res = await authFetch(`${BASE_URL}/morning/${checkinId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const addActivityAPI = async (checkinId, payload) => {
  const res = await authFetch(`${BASE_URL}/morning/activity/${checkinId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteActivityAPI = async (activityId) => {
  const res = await authFetch(`${BASE_URL}/morning/activity/${activityId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return handleResponse(res);
};

// ================= EVENING =================

export const createEveningAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/evening`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getEveningAPI = async (date) => {
  const res = await authFetch(`${BASE_URL}/evening/${date}`, {
    method: "GET",
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const updateEveningAPI = async (eveningId, payload) => {
  const res = await authFetch(`${BASE_URL}/evening/${eveningId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ================= SKILLS =================

export const getSkillsAPI = async () => {
  const res = await authFetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const createSkillAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/skills`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getSkillByIdAPI = async (skillId) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}`, {
    method: "GET",
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const updateSkillAPI = async (skillId, payload) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const createSkillActivitiesAPI = async (skillId, payload) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}/activities`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateSkillActivitiesAPI = async (skillId, payload) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}/activities`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteSkillActivityAPI = async (skillId, activityId) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}/activities/${activityId}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  return handleResponse(res);
};