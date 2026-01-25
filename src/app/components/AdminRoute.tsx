import { Navigate } from "react-router"; 
import { useAuth } from "@/app/context/AuthContext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useAuth();

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            <p className="text-sm text-slate-500">Verifying Admin Privileges...</p>
        </div>
    );
  }

  // If not admin, redirect to home (or login)
  if (profile?.role !== 'admin') {
     console.warn("Unauthorized access attempt to Admin Route. Role:", profile?.role, "User ID:", profile?.id);
     
     // Debugging aid: If user is logged in but profile is missing, show a message instead of redirecting immediately
     if (loading === false && !profile) {
         return (
             <div className="p-8 text-center bg-yellow-50 text-yellow-800">
                 <h1 className="text-xl font-bold">Profile Load Failed</h1>
                 <p className="mb-4">Logged in as {user?.email} but profile data is missing.</p>
                 <button onClick={() => window.location.reload()} className="px-4 py-2 bg-yellow-600 text-white rounded">Retry</button>
             </div>
         )
     }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
