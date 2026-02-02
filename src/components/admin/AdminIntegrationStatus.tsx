import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface IntegrationStatus {
  name: string;
  configured: boolean;
  connected: boolean | null;
  error: string | null;
  secrets: string[];
}

interface HealthCheckResponse {
  success: boolean;
  summary: {
    configured: string;
    connected: string;
    allConfigured: boolean;
    allConnected: boolean;
  };
  integrations: IntegrationStatus[];
}

export function AdminIntegrationStatus() {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-check`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthCheck();
  }, []);

  const getStatusIcon = (integration: IntegrationStatus) => {
    if (!integration.configured) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    if (integration.connected === true) {
      return <CheckCircle className="w-5 h-5 text-primary" />;
    }
    if (integration.connected === false) {
      return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
    // null = can't test (like Google OAuth)
    return <CheckCircle className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBadge = (integration: IntegrationStatus) => {
    if (!integration.configured) {
      return <Badge variant="destructive">Not Configured</Badge>;
    }
    if (integration.connected === true) {
      return <Badge variant="default">Connected</Badge>;
    }
    if (integration.connected === false) {
      return <Badge variant="outline">Error</Badge>;
    }
    return <Badge variant="secondary">Configured</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Check connectivity to all external services
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealthCheck}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-32 h-5" />
                </div>
                <Skeleton className="w-24 h-6" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchHealthCheck}>
              Try Again
            </Button>
          </div>
        ) : data ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Configured</p>
                <p className="text-2xl font-bold">{data.summary.configured}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{data.summary.connected}</p>
              </div>
            </div>

            {/* Integrations list */}
            <div className="space-y-3">
              {data.integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(integration)}
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      {integration.error && (
                        <p className="text-sm text-destructive mt-1">
                          {integration.error}
                        </p>
                      )}
                      {!integration.configured && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Required: {integration.secrets.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(integration)}
                </div>
              ))}
            </div>

            {/* Help link */}
            <div className="mt-6 pt-4 border-t">
              <a
                href="https://docs.lovable.dev/features/cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Learn how to configure secrets
              </a>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
