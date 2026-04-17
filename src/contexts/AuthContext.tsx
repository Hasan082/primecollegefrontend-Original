import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useGetCsrfTokenQuery, useGetMeQuery, useLogoutMutation } from "@/redux/apis/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/redux/api";

export type UserRole = "learner" | "trainer" | "admin" | "iqa";

export interface StaffProfile {
  staff_role: string;
  qualification_held: string;
  specialisms: string;
  centre_registration_number: string;
  standardisation_last_attended: string;
  cpd_record_url: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone?: string;
  full_name?: string;
  profile_picture?: string;
  bio?: string;
  date_of_birth?: string;
  staff_profile?: StaffProfile;
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
