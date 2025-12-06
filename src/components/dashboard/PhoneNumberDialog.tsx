import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Loader2, CheckCircle2, AlertCircle, Sparkles, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess?: (phoneNumber: string) => void;
}

const COUNTRY_OPTIONS = [
  { code: "31", country: "Netherlands", flag: "🇳🇱" },
  { code: "49", country: "Germany", flag: "🇩🇪" },
  { code: "33", country: "France", flag: "🇫🇷" },
  { code: "44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "1", country: "United States", flag: "🇺🇸" },
  { code: "34", country: "Spain", flag: "🇪🇸" },
  { code: "39", country: "Italy", flag: "🇮🇹" },
  { code: "32", country: "Belgium", flag: "🇧🇪" },
  { code: "43", country: "Austria", flag: "🇦🇹" },
  { code: "41", country: "Switzerland", flag: "🇨🇭" },
];

export function PhoneNumberDialog({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
}: PhoneNumberDialogProps) {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState("31");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [purchasedNumber, setPurchasedNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePurchase = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("buy-phone-number", {
        body: {
          organizationId,
          areaCode: selectedCountry,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.phoneNumber) {
        setStatus("success");
        setPurchasedNumber(data.phoneNumber);
        toast({
          title: "Phone number activated!",
          description: `Your AI is now reachable at ${data.phoneNumber}`,
        });
        onSuccess?.(data.phoneNumber);
      } else {
        throw new Error("Failed to get phone number");
      }
    } catch (error: any) {
      console.error("Error purchasing phone number:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to purchase phone number");
      toast({
        variant: "destructive",
        title: "Failed to get phone number",
        description: error.message || "Please try again or contact support",
      });
    }
  };

  const handleClose = () => {
    if (status !== "loading") {
      onOpenChange(false);
      // Reset after animation
      setTimeout(() => {
        setStatus("idle");
        setPurchasedNumber("");
        setErrorMessage("");
      }, 200);
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(purchasedNumber);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center relative">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-800 animate-ping opacity-20" />
            </div>
            
            <DialogTitle className="text-2xl font-serif mb-2">
              🎉 You're Live!
            </DialogTitle>
            <DialogDescription className="mb-6 text-base">
              Your AI receptionist is ready to answer calls
            </DialogDescription>
            
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 mb-6">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Your AI Phone Number</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-mono font-bold text-foreground tracking-wide">
                  {purchasedNumber}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={copyNumber}
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>✅ Customers can now call this number 24/7</p>
              <p>✅ Your AI will answer in your configured language</p>
              <p>✅ All calls are logged to your dashboard</p>
            </div>

            <Button onClick={handleClose} size="lg" className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Continue to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-serif">
                Get Your AI Phone Number
              </DialogTitle>
              <DialogDescription className="text-base">
                Choose a country for your local phone number
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</span>
                <span>of 3 steps</span>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Select Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.code} value={option.code} className="py-3">
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{option.flag}</span>
                          <span className="font-medium">{option.country}</span>
                          <span className="text-muted-foreground">+{option.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">Included in your plan</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Phone number + 24/7 AI answering
                    </p>
                  </div>
                </div>
              </div>

              {status === "error" && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">Something went wrong</p>
                    <p className="text-sm text-destructive/80">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePurchase}
                size="lg"
                className="w-full text-lg h-14"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Your Number...
                  </>
                ) : (
                  <>
                    Get My Number
                    <Phone className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={status === "loading"}
                className="text-muted-foreground"
              >
                I'll do this later
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PhoneNumberDialog;
