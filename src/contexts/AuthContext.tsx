import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useGetCsrfTokenQuery, useGetMeQuery, useLogoutMutation } from "@/redux/apis/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/redux/api";

export type UserRole = "learner" | "trainer" | "admin" | "iqa";

interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: (redirectPath?: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useGetCsrfTokenQuery(undefined);
  const { data: userData, isLoading } = useGetMeQuery(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logoutMutation] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setCurrentUser(userData?.data?.user || null);
  }, [userData]);

  const user = currentUser;
  const isAuthenticated = !!currentUser;

  const logout = async (redirectPath: string = "/") => {
    try {
      await logoutMutation(undefined).unwrap();
    } catch (error) {

    } finally {
      setCurrentUser(null);
      dispatch(api.util.resetApiState());
      navigate(redirectPath);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
