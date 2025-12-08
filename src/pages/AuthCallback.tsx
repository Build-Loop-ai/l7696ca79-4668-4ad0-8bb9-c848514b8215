import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  useEffect(() => {
    // Prevent double handling
    if (hasHandled.current) return;

    const handleRedirect = async (userId: string) => {
      try {
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .single();

        if (profileError) {
          // Profile might not exist yet for new users, send to onboarding
          console.log("Profile not found, redirecting to onboarding");
          navigate("/onboarding", { replace: true });
          return;
        }

        // Redirect based on onboarding status
        if (profile?.onboarding_completed) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    // Listen for auth state changes - this catches the OAuth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth callback event:", event, "session:", !!session);
        
        if (hasHandled.current) return;

        if (event === "SIGNED_IN" && session?.user) {
          hasHandled.current = true;
          await handleRedirect(session.user.id);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          hasHandled.current = true;
          await handleRedirect(session.user.id);
        }
      }
    );

    // Also check for existing session (in case auth state already established)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !hasHandled.current) {
        hasHandled.current = true;
        await handleRedirect(session.user.id);
      }
    };

    // Small delay to allow OAuth tokens to be processed
    setTimeout(checkExistingSession, 100);

    // Fallback timeout - if nothing happens in 5 seconds, go to login
    const timeout = setTimeout(() => {
      if (!hasHandled.current) {
        console.log("Auth callback timeout, redirecting to login");
        navigate("/login", { replace: true });
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center mb-4">
        <Phone className="w-5 h-5 text-white" />
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
};

export default AuthCallback;
