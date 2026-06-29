// API base. Override with VITE_API_BASE_URL in a .env file if needed.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8777/api/v1";
