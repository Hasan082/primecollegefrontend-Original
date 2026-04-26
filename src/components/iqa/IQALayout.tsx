import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserCircle, LogOut, ChevronDown, KeyRound } from "lucide-react";
import logo from "@/assets/prime-logo-white-notext.png";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import IQASidebar from "@/components/iqa/IQASidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMeQuery } from "@/redux/apis/authApi";
import LoadingSpinner from "../LoadingSpinner";

const IQALayout = () => {
  const { data: userData, isLoading } = useGetMeQuery(undefined);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const user = userData?.data?.user;
  const staffRole = user?.staff_profile?.staff_role || "";
  const canManageSamplingSettings = user?.role === "admin" || staffRole === "lead_iqa" || staffRole === "admin";

  useEffect(() => {
    if (
      !isLoading &&
      (!user || user.role !== "iqa")
    ) {
      navigate("/staff-login", { replace: true });
      return;
    }

    if (!isLoading && location.pathname === "/iqa/settings" && !canManageSamplingSettings) {
      navigate("/iqa/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname, canManageSamplingSettings]);

  const handleLogout = () => {
    logout("/staff-login");
  };

  if (isLoading) return <LoadingSpinner />;

  if (!user || user.role !== "iqa") {
    return <LoadingSpinner />;
  }

  if (location.pathname === "/iqa/settings" && !canManageSamplingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">You do not have access to Sampling Settings.</p>
          <p className="text-sm text-muted-foreground mt-2">Sampling policy changes are restricted to admin or lead IQA users.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <header className="bg-primary text-primary-foreground sticky top-0 z-30">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10 rounded-md p-1.5" />
              <a
                href="/"
                className="w-8 h-8 rounded-full border border-primary-foreground/30 p-0.5 block"
              >
                <img
                  src={logo}
                  alt="Prime College"
                  className="w-full h-full object-contain"
                />
              </a>
              <span className="text-lg font-bold hidden sm:inline">
                IQA Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {userData?.data?.user?.first_name +
                      " " +
                      userData?.data?.user?.last_name}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/iqa/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/iqa/change-password"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4" />
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <IQASidebar canManageSamplingSettings={canManageSamplingSettings} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default IQALayout;
