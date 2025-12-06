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
import { Phone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-serif mb-2">
              You're All Set!
            </DialogTitle>
            <DialogDescription className="mb-6">
              Your AI receptionist is now live and ready to take calls
            </DialogDescription>
            <div className="p-4 rounded-xl bg-muted/50 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Your AI phone number</p>
              <p className="text-2xl font-mono font-medium text-foreground">
                {purchasedNumber}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Forward your business calls to this number, or share it directly with customers.
            </p>
            <Button onClick={handleClose} className="w-full">
              Got it!
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center font-serif">
                Get Your AI Phone Number
              </DialogTitle>
              <DialogDescription className="text-center">
                Choose a country to get a local phone number for your AI receptionist
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        <span className="flex items-center gap-2">
                          <span>{option.flag}</span>
                          <span>{option.country}</span>
                          <span className="text-muted-foreground">+{option.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p>
                  📞 Phone number included in your plan
                </p>
                <p className="mt-1">
                  Your AI will answer calls 24/7 in your configured language
                </p>
              </div>

              {status === "error" && (
                <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={status === "loading"}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                className="flex-1"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Number...
                  </>
                ) : (
                  "Get Number"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PhoneNumberDialog;
