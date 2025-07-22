import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

type Role = "admin" | "editor" | "viewer" | null;
type AccessLevel = "read" | "write" | "admin";
type Status = "active" | "inactive" | "suspended";

interface UserAccess {
  id: string;
  user_id: string;
  role: Role;
  access_level: AccessLevel;
  resource_scope: string[];
  status: Status;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: any | null;
  userAccess: UserAccess | null;
  role: Role;
  accessLevel: AccessLevel;
  resourceScope: string[];
  status: Status;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any) => void;
  setUserAccess: (userAccess: UserAccess) => void;
  setRole: (role: Role) => void;
  setAccessLevel: (level: AccessLevel) => void;
  setResourceScope: (scope: string[]) => void;
  setStatus: (status: Status) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  canAccess: (component: string) => boolean;
  reset: () => void;
}

const getInitialState = () => {
  const storedUser = localStorage.getItem("user");
  const storedUserAccess = localStorage.getItem("userAccess");
  let resourceScope = [];
  if (storedUserAccess) {
    try {
      const parsed = JSON.parse(storedUserAccess);
      resourceScope = Array.isArray(parsed.resource_scope) ? parsed.resource_scope : [];
    } catch {
      resourceScope = [];
    }
  }
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    userAccess: storedUserAccess ? JSON.parse(storedUserAccess) : null,
    role: storedUserAccess ? JSON.parse(storedUserAccess).role : null,
    accessLevel: storedUserAccess ? JSON.parse(storedUserAccess).access_level : null,
    resourceScope,
    status: storedUserAccess ? JSON.parse(storedUserAccess).status : null,
    isAuthenticated: !!storedUser,
    isLoading: false,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),
  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },
  setUserAccess: (userAccess) => {
    if (userAccess) {
      localStorage.setItem("userAccess", JSON.stringify(userAccess));
      set({
        userAccess,
        role: userAccess.role,
        accessLevel: userAccess.access_level,
        resourceScope: userAccess.resource_scope,
        status: userAccess.status
      });
    } else {
      localStorage.removeItem("userAccess");
      set({
        userAccess: null,
        role: null,
        accessLevel: null,
        resourceScope: [],
        status: null
      });
    }
  },
  setRole: (role) => { set({ role }); },
  setAccessLevel: (accessLevel) => { set({ accessLevel }); },
  setResourceScope: (resourceScope) => { set({ resourceScope }); },
  setStatus: (status) => { set({ status }); },
  setAuthenticated: (isAuthenticated) => { set({ isAuthenticated }); },
  setLoading: (isLoading) => { set({ isLoading }); },
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session && data.user) {
        get().setUser(data.user);
        get().setAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      return { success: false, error: "Network error occurred" };
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      return { success: false, error: "Network error occurred" };
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // ignore
    } finally {
      get().reset();
    }
  },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        get().setUser(session.user);
        get().setAuthenticated(true);
      } else {
        get().reset();
      }
    } catch (error) {
      get().reset();
    } finally {
      set({ isLoading: false });
    }
  },
  canAccess: () => {
    return get().isAuthenticated;
  },
  reset: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userAccess");
    set({
      user: null,
      userAccess: null,
      role: null,
      accessLevel: null,
      resourceScope: [],
      status: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
}));