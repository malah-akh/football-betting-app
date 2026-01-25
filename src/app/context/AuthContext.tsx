import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // Basic debounce / lock to prevent multiple rapid fetches
    if (loading && profile) return; 

    console.log(`[AuthContext] Fetching profile for ${userId}...`);
    try {
      console.log(`[AuthContext] Fetching profile for ${userId}...`);
      
      // Use AbortController for cleaner timeout handling (1.5s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const { data, error } = await supabase
        .from("profiles")
        .select("*") // Fetch all fields to satisfy Profile type
        .eq("id", userId)
        .single()
        // @ts-ignore - abortSignal exists in v2 but types might be mismatching in some environments
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error && error.code !== 'PGRST116') { 
        // Filter out AbortError logging if we want, or logs it as simplified error
        if (error.message && error.message.includes('aborted')) {
             console.error("[AuthContext] Profile fetch timed out (1.5s)");
             throw new Error("Profile fetch timed out");
        }
        console.error("[AuthContext] Error fetching profile:", error.message || error);
      } else {
        if (data) {
            console.log("[AuthContext] Profile fetched successfully:", data.role);
            setProfile({
                ...data,
                is_premium: data.is_premium ?? false,
                role: data.role ?? 'user'
            });
        } else {
            console.error("[AuthContext] Profile not found for ID:", userId);
        }
      }
    } catch (err) {
      console.error("[AuthContext] Unexpected error fetching profile:", err);
      // Fallback: If timeout or error, maybe set partial profile so we don't stick in limbo?
      // But for AdminRoute, we need the role. 
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initAuth = async (retryCount = 0) => {
        try {
            console.log(`[AuthContext] Checking initial session... (Attempt ${retryCount + 1})`);
            // Use getSession but don't block heavily
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            console.log("[AuthContext] Session found:", !!session, session?.user?.email);

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                // If no session is found, we can stop loading immediately.
                // If a session IS found, we keep loading=true and let onAuthStateChange
                // handle the profile fetch and eventually set loading=false.
                if (!session) {
                    setLoading(false);
                }
            }
        } catch (err: any) {
            // Retry on AbortError (often caused by strict mode or concurrent lock requests)
            if (retryCount < 5 && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
                const delay = 500 * (retryCount + 1); // Exponential backoff: 500ms, 1000ms, 1500ms...
                console.warn(`[AuthContext] Session fetch aborted (Attempt ${retryCount + 1}), retrying in ${delay}ms...`);
                setTimeout(() => {
                    if (mounted) initAuth(retryCount + 1);
                }, delay);
                return; // Don't set loading false yet
            }

            console.error("Auth initialization error:", err);
            // If we failed after multiple attempts, we must stop loading to let the app render (likely as guest)
            if (mounted) setLoading(false);
        } 
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        
        console.log("Auth State Change:", _event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
             // Only fetch if we haven't already OR if user ID changed
             await fetchProfile(session.user.id);
        } else {
             setProfile(null);
        }
        
        // Ensure loading is false after state change handled
        setLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  // Use a variable to fix the typo in the cleanup function above if I made one, but wait, 'subscription' is returned.
  // Correcting the subscription variable usage in my mind before writing:
  // const { data: { subscription } } = ...
  // return () => subscription.unsubscribe();

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
