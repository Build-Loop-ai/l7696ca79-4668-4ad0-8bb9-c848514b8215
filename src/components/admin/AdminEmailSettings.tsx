import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Save, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailConfig {
  id: string;
  from_email: string;
  from_name: string;
  reply_to_email: string | null;
}

export function AdminEmailSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email config:', error);
      }

      if (data) {
        setConfig(data);
        setFromName(data.from_name);
        setFromEmail(data.from_email);
        setReplyToEmail(data.reply_to_email || '');
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fromEmail.trim() || !fromName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'From name and email are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (config) {
        const { error } = await supabase
          .from('email_config')
          .update({
            from_name: fromName.trim(),
            from_email: fromEmail.trim(),
            reply_to_email: replyToEmail.trim() || null,
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_config')
          .insert({
            from_name: fromName.trim(),
            from_email: fromEmail.trim(),
            reply_to_email: replyToEmail.trim() || null,
            updated_by: user?.id,
          });

        if (error) throw error;
      }

      toast({
        title: 'Settings saved',
        description: 'Email configuration updated successfully',
      });
      
      fetchConfig();
    } catch (err: any) {
      console.error('Error saving config:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const domain = fromEmail.split('@')[1] || '';
  const isCustomDomain = domain && domain !== 'resend.dev';

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Email Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure the sender details for all outgoing emails (invitations, alerts, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To send emails from your own domain, you need to{' '}
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:no-underline"
              >
                verify your domain in Resend
              </a>
              {' '}first. The domain must match your Resend API key.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromName">Sender Name</Label>
              <Input
                id="fromName"
                placeholder="AI Receptionist"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The name that appears in the "From" field
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">Sender Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="notifications@yourdomain.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Must be from a verified domain in Resend
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replyTo">Reply-To Email (Optional)</Label>
            <Input
              id="replyTo"
              type="email"
              placeholder="support@yourdomain.com"
              value={replyToEmail}
              onChange={(e) => setReplyToEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Where replies to your emails will be sent
            </p>
          </div>

          {/* Domain status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Current domain:</span>
            {isCustomDomain ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {domain}
              </Badge>
            ) : (
              <Badge variant="secondary">
                {domain || 'Not set'} (Default)
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Manage domains in Resend
              <ExternalLink className="h-3 w-3" />
            </a>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Email Preview</CardTitle>
          <CardDescription>
            This is how your emails will appear to recipients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-border bg-muted/30 font-mono text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">From:</span>{' '}
              <span className="text-foreground">{fromName || 'AI Receptionist'} &lt;{fromEmail || 'notifications@resend.dev'}&gt;</span>
            </p>
            {replyToEmail && (
              <p>
                <span className="text-muted-foreground">Reply-To:</span>{' '}
                <span className="text-foreground">{replyToEmail}</span>
              </p>
            )}
            <p>
              <span className="text-muted-foreground">To:</span>{' '}
              <span className="text-foreground">recipient@example.com</span>
            </p>
            <p>
              <span className="text-muted-foreground">Subject:</span>{' '}
              <span className="text-foreground">You're invited to join Acme Corp</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
