import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (err: any): string => {
  if (!err) return "An unknown error occurred";

  if (typeof err === "string") {
    return err;
  }

  if (err instanceof Error) {
    return err.message;
  }

  // Handle API error responses
  if (err.detail) {
    return typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
  }

  if (err.message) {
    return typeof err.message === "string" ? err.message : JSON.stringify(err.message);
  }

  if (err.error) {
    return typeof err.error === "string" ? err.error : JSON.stringify(err.error);
  }

  // Fallback
  return JSON.stringify(err);
};
