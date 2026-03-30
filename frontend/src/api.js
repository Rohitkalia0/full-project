const BASE_URL = "https://full-project-9w4o.onrender.com/api/v1";

const jsonHeaders = { "Content-Type": "application/json" };

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
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) throw new Error("Refresh failed");
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
  options.credentials = "include";
  let res = await fetch(url, options);

  if (res.status === 401) {
    try {
      await ensureFreshToken();
      res = await fetch(url, options);
    } catch {
      // Refresh failed — force logout
      localStorage.removeItem("is_logged_in");
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
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const loginAPI = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const logoutAPI = async () => {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  return handleResponse(res);
};

// ================= USER =================

export const updateUserAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/users`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const uploadPhotoAPI = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await authFetch(`${BASE_URL}/users/profile-picture`, {
    method: "PATCH",
    body: formData
  });
  return handleResponse(res);
};

export const getUserAPI = async () => {
  const res = await authFetch(`${BASE_URL}/users/me`);
  return handleResponse(res);
};

// ================= SETTINGS =================

export const createSettingAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/settings`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getSettingAPI = async () => {
  const res = await authFetch(`${BASE_URL}/settings`);
  return handleResponse(res);
};

export const updateSettingAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/settings`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const removePhotoAPI = async () => {
  const res = await authFetch(`${BASE_URL}/users/profile-picture`, { method: "DELETE" });
  return handleResponse(res);
};

// ================= MORNING =================

export const createMorningAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/morning`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getMorningAPI = async (date) => {
  const res = await authFetch(`${BASE_URL}/morning/${date}`);
  return handleResponse(res);
};

export const updateMorningAPI = async (checkinId, payload) => {
  const res = await authFetch(`${BASE_URL}/morning/${checkinId}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const addActivityAPI = async (checkinId, payload) => {
  const res = await authFetch(`${BASE_URL}/morning/activity/${checkinId}`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteActivityAPI = async (activityId) => {
  const res = await authFetch(`${BASE_URL}/morning/activity/${activityId}`, { method: "DELETE" });
  return handleResponse(res);
};

// ================= EVENING =================

export const createEveningAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/evening`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getEveningAPI = async (date) => {
  const res = await authFetch(`${BASE_URL}/evening/${date}`);
  return handleResponse(res);
};

export const updateEveningAPI = async (eveningId, payload) => {
  const res = await authFetch(`${BASE_URL}/evening/${eveningId}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ================= SKILLS =================

export const getSkillsAPI = async () => {
  const res = await authFetch(`${BASE_URL}/skills`);
  return handleResponse(res);
};

export const createSkillAPI = async (payload) => {
  const res = await authFetch(`${BASE_URL}/skills`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const getSkillByIdAPI = async (skillId) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}`);
  return handleResponse(res);
};

export const updateSkillAPI = async (skillId, payload) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const createSkillActivitiesAPI = async (skillId, payload) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}/activities`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const updateSkillActivitiesAPI = async (skillId, payload) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}/activities`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const deleteSkillActivityAPI = async (skillId, activityId) => {
  const res = await authFetch(`${BASE_URL}/skills/${skillId}/activities/${activityId}`, { method: "DELETE" });
  return handleResponse(res);
};
