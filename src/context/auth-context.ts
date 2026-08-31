import { createContext } from "react";

import type {
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
} from "@/types/Auth";

export interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  sessionMessage: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser>;
  restoreSession: () => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
