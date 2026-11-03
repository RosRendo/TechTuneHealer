import axios from "axios";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "/api-proxy";
  }
  return "http://localhost:8013";
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

// Attach JWT token from localStorage on every request (admin or provider)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = getApiBaseUrl();
    const token =
      localStorage.getItem("admin_token") || localStorage.getItem("provider_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to the correct login on 401/403
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const onProviderPortal = path.startsWith("/provider");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        localStorage.removeItem("provider_token");
        localStorage.removeItem("provider_user");
        window.location.href = onProviderPortal ? "/provider/login" : "/admin-login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
