import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Insight {
  type: 'warning' | 'growth' | 'opportunity' | 'info';
  title: string;
  description: string;
}

interface AdminAIInsightsProps {
  metrics: {
    totalOrganizations: number;
    totalUsers: number;
    totalCalls: number;
    activePhoneNumbers: number;
  } | null;
}

export const AdminAIInsights = ({ metrics }: AdminAIInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsights = async () => {
    if (!metrics) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-insights', {
        body: { metrics }
      });

      if (error) throw error;

      setInsights(data.insights || []);
      setHasGenerated(true);
    } catch (err) {
      console.error('Error generating insights:', err);
      toast.error('Failed to generate AI insights');
      setInsights([
        {
          type: 'info',
          title: 'Platform Overview',
          description: `Currently managing ${metrics.totalOrganizations} organizations with ${metrics.totalUsers} users.`
        }
      ]);
      setHasGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'growth': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-info" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'warning': return <Badge variant="outline" className="bg-warning-muted text-warning border-warning/20">Warning</Badge>;
      case 'growth': return <Badge variant="outline" className="bg-success-muted text-success border-success/20">Growth</Badge>;
      case 'opportunity': return <Badge variant="outline" className="bg-info-muted text-info border-info/20">Opportunity</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            AI Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={loading || !metrics}
            className="h-8"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            )}
            {hasGenerated ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasGenerated ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Click "Generate" to get AI-powered insights</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No insights available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="flex gap-3 p-3 rounded-xl bg-background/60 border border-border/50"
              >
                <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{insight.title}</span>
                    {getInsightBadge(insight.type)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
