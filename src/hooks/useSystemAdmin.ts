import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSystemAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystemAdmin = async () => {
      if (!user) {
        setIsSystemAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Call the database function to check system admin status
        const { data, error } = await supabase
          .rpc('is_system_admin', { _user_id: user.id });

        if (error) {
          console.error('Error checking system admin status:', error);
          setIsSystemAdmin(false);
        } else {
          setIsSystemAdmin(data === true);
        }
      } catch (err) {
        console.error('Error checking system admin:', err);
        setIsSystemAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkSystemAdmin();
    }
  }, [user, authLoading]);

  return { isSystemAdmin, loading: loading || authLoading };
};
