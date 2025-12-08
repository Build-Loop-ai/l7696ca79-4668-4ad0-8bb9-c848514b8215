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
      // Fallback to basic insights
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
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'growth': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'warning': return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Warning</Badge>;
      case 'growth': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Growth</Badge>;
      case 'opportunity': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Opportunity</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={loading || !metrics}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {hasGenerated ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasGenerated ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Generate" to get AI-powered insights about your platform</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No insights available at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
              >
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{insight.title}</span>
                    {getInsightBadge(insight.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
