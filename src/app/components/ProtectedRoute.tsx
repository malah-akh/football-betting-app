import { useAuth } from "@/app/context/AuthContext";
import { Navigate, useLocation } from "react-router";
import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading state that matches the app layout
    return (
      <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    // Redirect to login, but could strictly save the location state to redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
