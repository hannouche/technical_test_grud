import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = normalizeErrorMessage(error);
    return Promise.reject(new Error(message));
  },
);

export function normalizeErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const err = error as any;
    
    if (err.response && err.response.data && err.response.data.message) {
      const msg = err.response.data.message;
      if (Array.isArray(msg)) {
        return msg.join(", ");
      }
      if (typeof msg === "string") {
        return msg;
      }
    }
    
    if (err.message) {
      return err.message;
    }
  }

  return "Something went wrong. Please try again.";
}
