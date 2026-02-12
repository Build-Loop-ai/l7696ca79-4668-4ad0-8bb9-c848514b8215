import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const { data: onboardingCompleted, isLoading: checkingOnboarding } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user!.id)
        .single();
      return profile?.onboarding_completed ?? false;
    },
    enabled: !!user && !loading,
  });

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If on dashboard but onboarding not completed, redirect to onboarding
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isOnboardingRoute = location.pathname === '/onboarding';

  if (isDashboardRoute && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // If on onboarding but already completed, redirect to dashboard
  if (isOnboardingRoute && onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;