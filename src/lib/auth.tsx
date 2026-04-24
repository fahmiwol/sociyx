import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "./api";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  orgId: number;
  orgName: string;
  orgSlug: string;
  plan: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, orgName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(({ user: u }) => setUser({
        id: u.id, email: u.email, fullName: u.full_name, role: u.role,
        orgId: u.org_id, orgName: u.org_name, orgSlug: u.org_slug, plan: u.plan
      }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { user: u } = await authApi.login(email, password);
    setUser({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, orgId: u.orgId, orgName: u.orgName, orgSlug: u.orgSlug, plan: u.plan });
  }

  async function register(email: string, password: string, fullName: string, orgName: string) {
    await authApi.register(email, password, fullName, orgName);
    const { user: u } = await authApi.me();
    setUser({ id: u.id, email: u.email, fullName: u.full_name, role: u.role, orgId: u.org_id, orgName: u.org_name, orgSlug: u.org_slug, plan: u.plan });
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
