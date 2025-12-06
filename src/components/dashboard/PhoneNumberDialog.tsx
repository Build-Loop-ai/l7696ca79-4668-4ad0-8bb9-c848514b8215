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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Loader2, CheckCircle2, AlertCircle, Sparkles, Copy, Globe, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAvailableCountries, getCountryByCode, type PhoneCountry } from "@/lib/phone-countries";
import { formatPhoneNumber } from "@/lib/phone-utils";

interface PhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess?: (phoneNumber: string) => void;
}

export function PhoneNumberDialog({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
}: PhoneNumberDialogProps) {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [areaCode, setAreaCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [purchasedNumber, setPurchasedNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const countries = getAvailableCountries();
  const country = getCountryByCode(selectedCountry);

  const handlePurchase = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("buy-phone-number", {
        body: {
          organizationId,
          countryCode: selectedCountry,
          areaCode: areaCode || undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

          if (data?.success && data?.phoneNumber) {
        setStatus("success");
        setPurchasedNumber(data.phoneNumber);
        
        const isConnected = data.connected || data.vapiPhoneId;
        toast({
          title: isConnected ? "Phone number activated!" : "Phone number added",
          description: isConnected 
            ? `Your AI is now reachable at ${formatPhoneNumber(data.phoneNumber)}`
            : `Number ${formatPhoneNumber(data.phoneNumber)} added. Connecting to AI...`,
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
      setTimeout(() => {
        setStatus("idle");
        setPurchasedNumber("");
        setErrorMessage("");
        setAreaCode("");
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
                <p className="text-2xl font-mono font-bold text-foreground tracking-wide">
                  {formatPhoneNumber(purchasedNumber)}
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

            <div className="space-y-3 text-sm text-muted-foreground mb-6 text-left">
              <p className="font-medium text-foreground">Next steps:</p>
              <div className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <p>Forward your business phone to this number</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <p>Your AI will answer calls 24/7</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <p>All calls are logged to your dashboard</p>
              </div>
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
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-serif">
                Get Your AI Phone Number
              </DialogTitle>
              <DialogDescription className="text-base">
                Choose a country to get a real local phone number
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="py-3">
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{c.flag}</span>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-muted-foreground ml-auto">€{c.monthlyPriceEur}/mo</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {country && (
                <div className="space-y-2">
                  <Label>{country.areaCodeLabel} (Optional)</Label>
                  <Input
                    placeholder={country.areaCodePlaceholder}
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    maxLength={country.areaCodeLength || 5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to get any available number
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">Real phone number included</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Customers can call this number directly or you can forward your existing business line
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
                    Get {country?.flag} {country?.prefix} Number
                    <ArrowRight className="w-5 h-5 ml-2" />
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
