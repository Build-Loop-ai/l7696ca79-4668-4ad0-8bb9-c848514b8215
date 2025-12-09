import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Lock, Eye, EyeOff, Users, Building, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  organization_name: string;
  inviter_name: string;
  expires_at: string;
}

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { config } = useSiteConfigTransformed();
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  // Fetch invitation details using secure RPC function
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Invalid invitation link. Please request a new invitation.");
        setIsLoadingInvitation(false);
        return;
      }

      try {
        // Use the secure RPC function that bypasses RLS for unauthenticated users
        const { data, error: rpcError } = await supabase
          .rpc('get_invitation_by_token', { invite_token: token });

        if (rpcError || !data || data.length === 0) {
          setError("Invitation not found. It may have been revoked or expired.");
          setIsLoadingInvitation(false);
          return;
        }

        const invitationData = data[0];

        if (invitationData.status !== "pending") {
          setError("This invitation has already been used.");
          setIsLoadingInvitation(false);
          return;
        }

        if (new Date(invitationData.expires_at) < new Date()) {
          setError("This invitation has expired. Please request a new one.");
          setIsLoadingInvitation(false);
          return;
        }

        setInvitation({
          id: invitationData.id,
          email: invitationData.email,
          role: invitationData.role,
          organization_name: invitationData.organization_name || "Unknown Organization",
          inviter_name: invitationData.inviter_name || "A team member",
          expires_at: invitationData.expires_at,
        });
      } catch (err) {
        console.error("Error fetching invitation:", err);
        setError("Failed to load invitation details.");
      } finally {
        setIsLoadingInvitation(false);
      }
    };

    fetchInvitation();
  }, [token]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Sign up with the invitation email - use email as the name initially
      const { error: signUpError } = await signUp(invitation.email, password, invitation.email.split('@')[0]);
      
      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          navigate(`/login?email=${encodeURIComponent(invitation.email)}`);
        } else {
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: signUpError.message,
          });
        }
        return;
      }
      
      toast({
        title: "Welcome to the team!",
        description: `You've joined ${invitation.organization_name}.`,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (authLoading || isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center animate-pulse">
          <Phone className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Invitation Info */}
      <div className="hidden lg:flex flex-1 hero-gradient relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-serif text-white mb-4">
            You've been invited!
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {invitation?.inviter_name} has invited you to join their team on {config.name}.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Organization</p>
                <p className="text-white font-medium">{invitation?.organization_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Your Role</p>
                <p className="text-white font-medium">{formatRole(invitation?.role || "member")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-medium text-foreground">
              {config.name}
            </span>
          </Link>

          {/* Mobile invitation info */}
          <div className="lg:hidden mb-8 p-4 rounded-xl bg-muted">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span>Team Invitation</span>
            </div>
            <p className="font-medium text-foreground mb-1">{invitation?.organization_name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{formatRole(invitation?.role || "member")}</Badge>
              <span className="text-xs text-muted-foreground">
                Invited by {invitation?.inviter_name}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif text-foreground mb-2">
              Accept your invitation
            </h1>
            <p className="text-muted-foreground">
              Create a password to join{" "}
              <span className="font-medium text-foreground">{invitation?.organization_name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={invitation?.email || ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                This is the email your invitation was sent to
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Join Team"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to={`/login?email=${encodeURIComponent(invitation?.email || "")}`}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
