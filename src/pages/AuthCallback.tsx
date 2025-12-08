import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/login");
          return;
        }

        if (!session?.user) {
          // No session, redirect to login
          navigate("/login");
          return;
        }

        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
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
        navigate("/login");
      }
    };

    handleAuthCallback();
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
