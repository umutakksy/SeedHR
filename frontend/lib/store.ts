import { create } from "zustand";
import { UserDto, authAPI } from "./api";

interface AppState {
  currentUser: UserDto | null;
  token: string | null;
  theme: "light" | "dark";
  activeTab: string;
  login: (user: UserDto, token: string) => void;
  logout: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setActiveTab: (tab: string) => void;
  checkAuth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  token: null,
  theme: "light",
  activeTab: "dashboard",

  login: (user: UserDto, token: string) => {
    if (typeof window !== "undefined") {
      try {
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("currentUser", JSON.stringify(user));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("refreshToken");
        }
      } catch (e) {
        console.error("localStorage setItem failed:", e);
      }
    }
    set({ currentUser: user || null, token: token || null });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
      } catch (e) {
        console.error("localStorage removeItem failed:", e);
      }
    }
    set({ currentUser: null, token: null, activeTab: "dashboard" });
  },

  setTheme: (theme: "light" | "dark") => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {
        console.error("localStorage setTheme failed:", e);
      }
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ theme });
  },

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  checkAuth: () => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("currentUser");
        const savedTheme = localStorage.getItem("theme") as "light" | "dark";

        if (savedTheme) {
          if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        if (token && userStr && token !== "undefined" && userStr !== "undefined") {
          try {
            const user = JSON.parse(userStr);
            if (user && typeof user === "object") {
              set({
                token,
                currentUser: user,
                theme: savedTheme || "light"
              });
              return;
            }
          } catch (e) {
            console.error("Error parsing currentUser from localStorage:", e);
          }
        }

        // Clear invalid or empty keys
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        set({
          token: null,
          currentUser: null,
          theme: savedTheme || "light"
        });
      } catch (e) {
        console.error("Error inside checkAuth:", e);
        set({
          token: null,
          currentUser: null,
          theme: "light"
        });
      }
    }
  }
}));
