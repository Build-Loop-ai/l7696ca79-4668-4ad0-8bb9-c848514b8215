import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly_cents: number;
  price_annual_cents: number | null;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  minutes_included: number;
  phone_numbers_limit: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export const AdminPlansTable = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price_monthly_cents: 0,
    price_annual_cents: 0,
    minutes_included: 100,
    phone_numbers_limit: 1,
    features: '',
    is_active: true,
    is_popular: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      setPlans(data?.map(p => ({
        ...p,
        features: Array.isArray(p.features) ? (p.features as string[]) : []
      })) || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading plans',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStripe = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-sync-products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync');
      }

      toast({
        title: 'Sync complete',
        description: `${result.synced?.length || 0} plans synced with Stripe`,
      });

      fetchPlans();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sync failed',
        description: error.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  const openAddDialog = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price_monthly_cents: 0,
      price_annual_cents: 0,
      minutes_included: 100,
      phone_numbers_limit: 1,
      features: '',
      is_active: true,
      is_popular: false,
    });
    setShowDialog(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price_monthly_cents: plan.price_monthly_cents,
      price_annual_cents: plan.price_annual_cents || 0,
      minutes_included: plan.minutes_included,
      phone_numbers_limit: plan.phone_numbers_limit,
      features: plan.features.join('\n'),
      is_active: plan.is_active,
      is_popular: plan.is_popular,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const planData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price_monthly_cents: formData.price_monthly_cents,
        price_annual_cents: formData.price_annual_cents || null,
        minutes_included: formData.minutes_included,
        phone_numbers_limit: formData.phone_numbers_limit,
        features: featuresArray,
        is_active: formData.is_active,
        is_popular: formData.is_popular,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast({ title: 'Plan updated' });
      } else {
        const { error } = await supabase
          .from('plans')
          .insert([{ ...planData, sort_order: plans.length + 1 }]);

        if (error) throw error;
        toast({ title: 'Plan created' });
      }

      setShowDialog(false);
      await fetchPlans();
      
      // Auto-sync to Stripe after save
      await handleSyncStripe();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving plan',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;
      toast({ title: 'Plan deleted' });
      await fetchPlans();
      
      // Note: Stripe products are not auto-deleted as they may have historical subscriptions
      // Admin can manually archive them in Stripe dashboard if needed
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting plan',
        description: error.message,
      });
    }
  };

  const formatCents = (cents: number) => {
    return `€${(cents / 100).toFixed(0)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pricing Plans</CardTitle>
            <CardDescription>Configure and manage subscription plans</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSyncStripe} disabled={syncing}>
              {syncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync to Stripe
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {plan.is_popular && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Popular
                        </Badge>
                      )}
                      {!plan.is_active && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCents(plan.price_monthly_cents)}/mo · {plan.minutes_included} min · {plan.phone_numbers_limit} numbers
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    {plan.stripe_price_id_monthly ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Synced
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <X className="w-4 h-4" /> Not synced
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {plans.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No plans configured yet</p>
                <Button className="mt-4" onClick={openAddDialog}>
                  Create First Plan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
            <DialogDescription>
              Configure the plan details and pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Growth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="growth"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="For growing businesses"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Monthly Price (cents)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  value={formData.price_monthly_cents}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_monthly_cents: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_annual">Annual Price (cents)</Label>
                <Input
                  id="price_annual"
                  type="number"
                  value={formData.price_annual_cents}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_annual_cents: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes Included</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={formData.minutes_included}
                  onChange={(e) => setFormData(prev => ({ ...prev, minutes_included: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_limit">Phone Numbers Limit</Label>
                <Input
                  id="phone_limit"
                  type="number"
                  value={formData.phone_numbers_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_numbers_limit: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                placeholder="100 AI call minutes&#10;1 phone number&#10;Email support"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                />
                <Label htmlFor="is_popular">Popular badge</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPlan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
