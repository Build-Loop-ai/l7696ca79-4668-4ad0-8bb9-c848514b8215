import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoogleCalendarIntegrationProps {
  organizationId: string;
}

export function GoogleCalendarIntegration({ organizationId }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Load current connection status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('organization_settings')
          .select('google_calendar_connected, google_calendar_email')
          .eq('organization_id', organizationId)
          .single();

        if (error) throw error;

        setIsConnected(data?.google_calendar_connected || false);
        setConnectedEmail(data?.google_calendar_email || null);
      } catch (error) {
        console.error('Failed to load calendar status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [organizationId]);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        toast.error('Calendar connection was cancelled');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state === organizationId) {
        setIsConnecting(true);
        try {
          const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
            body: {
              action: 'exchange-code',
              code,
              redirectUri: `${window.location.origin}/dashboard/settings`,
              organizationId,
            },
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);

          setIsConnected(true);
          setConnectedEmail(data.email);
          toast.success('Google Calendar connected successfully!');
        } catch (error: any) {
          console.error('Failed to connect calendar:', error);
          toast.error(error.message || 'Failed to connect Google Calendar');
        } finally {
          setIsConnecting(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleCallback();
  }, [organizationId]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'get-auth-url',
          redirectUri: `${window.location.origin}/dashboard/settings`,
          organizationId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Failed to start OAuth flow:', error);
      toast.error(error.message || 'Failed to start calendar connection');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-disconnect', {
        body: { organizationId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIsConnected(false);
      setConnectedEmail(null);
      toast.success('Google Calendar disconnected');
    } catch (error: any) {
      console.error('Failed to disconnect calendar:', error);
      toast.error(error.message || 'Failed to disconnect calendar');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Calendar</CardTitle>
              <CardDescription>
                Sync appointments with your Google Calendar
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
          >
            {isConnected ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Not Connected</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Connected Account</p>
                <p className="text-sm text-muted-foreground">{connectedEmail}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Your AI receptionist will:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check your calendar for real-time availability</li>
                <li>Create calendar events when booking appointments</li>
                <li>Avoid double-booking based on existing events</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to let your AI receptionist check availability 
              and create appointments automatically.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
