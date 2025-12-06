import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Mic,
  Phone,
  Link,
  Users,
  CreditCard,
  Play,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardSettings = () => {
  const [greeting, setGreeting] = useState(
    "Good morning! Thank you for calling Amsterdam Dental Care. How can I help you today?"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings and AI configuration.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="gap-2">
            <Building className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Mic className="w-4 h-4" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="phone" className="gap-2">
            <Phone className="w-4 h-4" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details that will be used by the AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input defaultValue="Amsterdam Dental Care" />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select defaultValue="dental">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dental">Dental Clinic</SelectItem>
                      <SelectItem value="medical">Medical Practice</SelectItem>
                      <SelectItem value="salon">Salon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="Keizersgracht 123, 1015 CD Amsterdam" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input defaultValue="+31 20 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="amsterdam">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amsterdam">
                        Europe/Amsterdam (CET)
                      </SelectItem>
                      <SelectItem value="london">Europe/London (GMT)</SelectItem>
                      <SelectItem value="paris">Europe/Paris (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice & Personality</CardTitle>
              <CardDescription>
                Customize how your AI receptionist sounds and behaves.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Voice</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "sarah", label: "Sarah (Friendly)", selected: true },
                    { id: "emma", label: "Emma (Professional)" },
                    { id: "james", label: "James (Friendly)" },
                    { id: "michael", label: "Michael (Professional)" },
                  ].map((voice) => (
                    <label
                      key={voice.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        voice.selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{voice.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="nl">Dutch</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Greeting</Label>
                <Textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Transfer Number (for escalations)</Label>
                <Input defaultValue="+31 6 9876 5432" />
                <p className="text-sm text-muted-foreground">
                  Calls will be transferred here when the AI can't help.
                </p>
              </div>

              <div className="flex gap-2">
                <Button>Save Changes</Button>
                <Button variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  Test AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Numbers Tab */}
        <TabsContent value="phone" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Phone Numbers</CardTitle>
                <CardDescription>
                  Manage your AI receptionist phone numbers.
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Number
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    number: "+31 20 123 4567",
                    name: "Main Line",
                    status: "active",
                    calls: 245,
                  },
                  {
                    number: "+31 20 765 4321",
                    name: "Emergency",
                    status: "active",
                    calls: 52,
                  },
                ].map((phone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium font-mono">
                          {phone.number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {phone.name} · {phone.calls} calls this month
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        Active
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>
                Connect your calendar for automatic appointment booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Google Calendar</div>
                    <div className="text-sm text-muted-foreground">
                      Connected to dr.sarah@amsterdamdental.com
                    </div>
                  </div>
                </div>
                <Button variant="outline">Disconnect</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Use the API for custom integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value="sk_live_••••••••••••••••••••••••"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input placeholder="https://your-server.com/webhook" />
              </div>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Invite and manage team members.
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Dr. Sarah van den Berg",
                    email: "sarah@amsterdamdental.com",
                    role: "Admin",
                  },
                  {
                    name: "Michael de Vries",
                    email: "michael@amsterdamdental.com",
                    role: "Manager",
                  },
                  {
                    name: "Emma Jansen",
                    email: "emma@amsterdamdental.com",
                    role: "Viewer",
                  },
                ].map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{member.role}</Badge>
                      {member.role !== "Admin" && (
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div>
                  <div className="text-lg font-serif font-medium text-primary">
                    Growth Plan
                  </div>
                  <div className="text-sm text-muted-foreground">
                    €197/month · Renews on April 15, 2024
                  </div>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Minutes Usage</div>
                    <div className="text-sm text-muted-foreground">
                      342 / 500 minutes used this month
                    </div>
                  </div>
                  <span className="text-2xl font-serif font-medium">68%</span>
                </div>
                <Progress value={68} className="h-3" />
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Manage Payment Method</Button>
                <Button variant="outline">View Invoices</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardSettings;
