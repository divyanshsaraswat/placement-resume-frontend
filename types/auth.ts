export type UserRole = "student" | "faculty" | "spc" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isSuperadmin: boolean;
  department?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
