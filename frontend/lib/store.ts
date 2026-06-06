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
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
    set({ currentUser: user, token });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
    }
    set({ currentUser: null, token: null, activeTab: "dashboard" });
  },

  setTheme: (theme: "light" | "dark") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
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

      if (token && userStr) {
        set({
          token,
          currentUser: JSON.parse(userStr),
          theme: savedTheme || "light"
        });
      } else {
        set({
          token: null,
          currentUser: null,
          theme: savedTheme || "light"
        });
      }
    }
  }
}));
