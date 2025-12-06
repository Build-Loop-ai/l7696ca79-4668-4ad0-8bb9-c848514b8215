import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, Mic, Volume2, AlertTriangle } from "lucide-react";
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

export function TestCallButton({
  assistantId,
  disabled = false,
  onCallStart,
  onCallEnd,
  phoneNumber,
}: TestCallButtonProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPhoneOption, setShowPhoneOption] = useState(false);

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (callStatus !== "idle") {
        try {
          const vapi = getVapiClient(publicKey);
          vapi.stop();
        } catch (e) {
          console.error("Error stopping call on unmount:", e);
        }
      }
    };
  }, [callStatus, publicKey]);

  const startTestCall = async () => {
    // Check browser support first
    const browserCheck = checkBrowserSupport();
    if (!browserCheck.supported) {
      setCallStatus("error");
      setStatusMessage(browserCheck.reason || "Browser not supported");
      setShowPhoneOption(true);
      return;
    }

    if (!publicKey) {
      setCallStatus("error");
      setStatusMessage("Voice testing not configured. Try calling the phone number directly.");
      setShowPhoneOption(true);
      return;
    }

    if (!assistantId) {
      setCallStatus("error");
      setStatusMessage("No AI assistant configured yet");
      return;
    }

    setCallStatus("connecting");
    setStatusMessage("Requesting microphone access...");
    setShowPhoneOption(false);

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
        if (errorMsg.includes("Failed to fetch") || errorMsg.includes("network")) {
          setStatusMessage("Connection failed. Try calling the phone number directly.");
          setShowPhoneOption(true);
        } else if (errorMsg.includes("permission") || errorMsg.includes("NotAllowed")) {
          setStatusMessage("Microphone access denied. Please allow microphone access.");
        } else {
          setStatusMessage("Call failed. Try calling the phone number directly.");
          setShowPhoneOption(true);
        }
      });

      await vapi.start(assistantId);
    } catch (error: any) {
      console.error("Error starting call:", error);
      setCallStatus("error");
      
      if (error.name === "NotAllowedError" || error.message?.includes("permission")) {
        setStatusMessage("Microphone access denied. Please allow microphone access and try again.");
      } else {
        setStatusMessage("Failed to start call. Try calling the phone number directly.");
        setShowPhoneOption(true);
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
    setShowPhoneOption(false);
    onCallEnd?.();
  };

  const isActive = callStatus !== "idle" && callStatus !== "error";

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
      {showPhoneOption && phoneNumber && (
        <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Call your AI directly:
          </p>
          <a 
            href={`tel:${phoneNumber}`}
            className="text-lg font-medium text-primary hover:underline"
          >
            {phoneNumber}
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
