import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, Mic, Volume2, AlertTriangle, ExternalLink } from "lucide-react";
import { getVapiClient, resetVapiClient } from "@/lib/vapi-client";
import { cn } from "@/lib/utils";

interface TestCallButtonProps {
  assistantId?: string;
  disabled?: boolean;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  phoneNumber?: string;
}

type CallStatus = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error";

// Check if browser supports WebRTC
const checkBrowserSupport = (): { supported: boolean; reason?: string } => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { supported: false, reason: "Your browser doesn't support microphone access" };
  }
  if (!window.RTCPeerConnection) {
    return { supported: false, reason: "Your browser doesn't support WebRTC" };
  }
  return { supported: true };
};

// Detect if running in sandboxed iframe (Lovable editor preview)
const isInSandboxedIframe = (): boolean => {
  // Not in an iframe at all - browser calls should work
  if (window.self === window.top) {
    console.log("[TestCallButton] Not in iframe, browser calls enabled");
    return false;
  }
  
  // We're in an iframe - check if it's sandboxed
  try {
    // Try to access parent - will throw in sandboxed/cross-origin iframes
    const _test = window.parent.location.href;
    console.log("[TestCallButton] In accessible iframe, browser calls enabled");
    return false;
  } catch {
    console.log("[TestCallButton] In sandboxed iframe, browser calls blocked");
    return true;
  }
};

export function TestCallButton({
  assistantId,
  disabled = false,
  onCallStart,
  onCallEnd,
  phoneNumber,
}: TestCallButtonProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPhoneOnly, setShowPhoneOnly] = useState(false);

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  
  // In Lovable preview, browser-based Vapi calls are blocked by sandbox
  // Show phone option directly instead of attempting and failing
  const inPreview = isInSandboxedIframe();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (callStatus !== "idle" && !inPreview) {
        try {
          const vapi = getVapiClient(publicKey);
          vapi.stop();
        } catch (e) {
          console.error("Error stopping call on unmount:", e);
        }
      }
    };
  }, [callStatus, publicKey, inPreview]);

  const startTestCall = async () => {
    // In Lovable preview, skip browser test and show phone option
    if (inPreview) {
      setShowPhoneOnly(true);
      setStatusMessage("Browser calls are not available in the preview. Use the phone number below.");
      return;
    }

    // Check browser support first
    const browserCheck = checkBrowserSupport();
    if (!browserCheck.supported) {
      setCallStatus("error");
      setStatusMessage(browserCheck.reason || "Browser not supported");
      setShowPhoneOnly(true);
      return;
    }

    if (!publicKey) {
      setCallStatus("error");
      setStatusMessage("Voice testing not configured. Try calling the phone number directly.");
      setShowPhoneOnly(true);
      return;
    }

    if (!assistantId) {
      setCallStatus("error");
      setStatusMessage("No AI assistant configured yet");
      return;
    }

    setCallStatus("connecting");
    setStatusMessage("Requesting microphone access...");
    setShowPhoneOnly(false);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatusMessage("Connecting to AI...");

      resetVapiClient();
      const vapi = getVapiClient(publicKey);

      vapi.on("call-start", () => {
        setCallStatus("connected");
        setStatusMessage("Connected - speak now");
        onCallStart?.();
      });

      vapi.on("call-end", () => {
        setCallStatus("idle");
        setStatusMessage("");
        onCallEnd?.();
      });

      vapi.on("speech-start", () => {
        setCallStatus("speaking");
        setStatusMessage("AI is speaking...");
      });

      vapi.on("speech-end", () => {
        setCallStatus("listening");
        setStatusMessage("Listening...");
      });

      vapi.on("error", (error) => {
        console.error("Vapi error:", error);
        setCallStatus("error");
        
        // Parse error for better messaging
        const errorMsg = error?.message || JSON.stringify(error);
        console.log("[TestCallButton] Vapi error message:", errorMsg);
        
        if (errorMsg.includes("permission") || errorMsg.includes("NotAllowed")) {
          setStatusMessage("Microphone access denied. Please allow microphone access.");
        } else if (errorMsg.includes("assistant") || errorMsg.includes("not found")) {
          setStatusMessage("AI assistant not found. Check configuration.");
        } else {
          setStatusMessage(`Connection error: ${errorMsg.substring(0, 100)}`);
          setShowPhoneOnly(true);
        }
      });

      await vapi.start(assistantId);
    } catch (error: any) {
      console.error("Error starting call:", error);
      setCallStatus("error");
      
      if (error.name === "NotAllowedError" || error.message?.includes("permission")) {
        setStatusMessage("Microphone access denied. Please allow microphone access and try again.");
      } else {
        setStatusMessage("Failed to start browser call. Use the phone number below.");
        setShowPhoneOnly(true);
      }
    }
  };

  const endCall = () => {
    try {
      const vapi = getVapiClient(publicKey);
      vapi.stop();
    } catch (e) {
      console.error("Error stopping call:", e);
    }
    setCallStatus("idle");
    setStatusMessage("");
    setShowPhoneOnly(false);
    onCallEnd?.();
  };

  const isActive = callStatus !== "idle" && callStatus !== "error";

  // If in preview and we have a phone number, show a simpler UI focused on calling
  if (inPreview && phoneNumber) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Browser testing is not available in the preview.
            <br />
            Call your AI receptionist directly:
          </p>
        </div>
        
        <a 
          href={`tel:${phoneNumber}`}
          className="w-full"
        >
          <Button variant="hero" size="lg" className="gap-2 w-full">
            <Phone className="w-5 h-5" />
            Call {phoneNumber}
          </Button>
        </a>

        <p className="text-xs text-muted-foreground text-center">
          Opens your phone app to call the AI
        </p>
      </div>
    );
  }

  // If no phone number in preview, show a message
  if (inPreview && !phoneNumber) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Button disabled variant="outline" size="lg" className="gap-2">
          <Phone className="w-5 h-5" />
          Test Your AI
        </Button>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Get a phone number first to test your AI receptionist
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!isActive ? (
        <Button
          onClick={startTestCall}
          disabled={disabled || !assistantId}
          variant="hero"
          size="lg"
          className="gap-2"
        >
          {callStatus === "error" ? (
            <>
              <Phone className="w-5 h-5" />
              Try Again
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Test Your AI
            </>
          )}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Animated call indicator */}
          <div className="relative">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                callStatus === "connecting" && "bg-muted animate-pulse",
                callStatus === "connected" && "bg-primary/10",
                callStatus === "speaking" && "bg-primary/20",
                callStatus === "listening" && "bg-primary/10"
              )}
            >
              {callStatus === "connecting" ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : callStatus === "speaking" ? (
                <Volume2 className="w-8 h-8 text-primary animate-pulse" />
              ) : (
                <Mic className="w-8 h-8 text-primary" />
              )}
            </div>
            
            {/* Pulsing rings for active call */}
            {isActive && callStatus !== "connecting" && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div
                  className="absolute inset-0 rounded-full border border-primary/20"
                  style={{ animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s" }}
                />
              </>
            )}
          </div>

          <Button
            onClick={endCall}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </Button>
        </div>
      )}

      {statusMessage && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground text-center max-w-xs">
          {isActive && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
          )}
          {callStatus === "error" && (
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
          {statusMessage}
        </div>
      )}

      {/* Show phone number option when browser test fails */}
      {showPhoneOnly && phoneNumber && (
        <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Call your AI directly:
          </p>
          <a 
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-2"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Phone className="w-4 h-4" />
              {phoneNumber}
              <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        </div>
      )}

      {!assistantId && !disabled && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Complete the setup to test your AI assistant
        </p>
      )}
    </div>
  );
}

export default TestCallButton;
