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
// WebRTC connections are blocked in sandboxed iframes, so we show phone-first UI
const isInSandboxedIframe = (): boolean => {
  // Not in an iframe at all - browser calls should work
  if (window.self === window.top) {
    return false;
  }
  
  // We're in an iframe - check if it's sandboxed
  try {
    // Try to access parent - will throw in sandboxed/cross-origin iframes
    const _test = window.parent.location.href;
    return false;
  } catch {
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
  
  // In sandboxed iframes, WebRTC is blocked - show phone option directly
  const inSandbox = isInSandboxedIframe();

  // Vapi public key for browser-based testing
  const publicKey = "3d8f4267-671a-4a72-924e-79ac9179df8f";

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

      let callStarted = false;
      let aiSpoke = false;
      let callStartTime: number | null = null;
      
      // Progress events for better debugging and user feedback
      vapi.on("call-start-progress" as any, (progress: any) => {
        console.log("[TestCallButton] Call progress:", progress);
        const stage = progress?.stage || "unknown";
        const stageMessages: Record<string, string> = {
          "creating-call": "Initializing call...",
          "fetching-assistant": "Loading AI assistant...",
          "connecting-to-room": "Establishing voice channel...",
          "joining-room": "Joining voice session...",
          "connected": "Connected to voice service...",
        };
        setStatusMessage(stageMessages[stage] || `Connecting (${stage})...`);
      });

      vapi.on("call-start-success" as any, () => {
        console.log("[TestCallButton] Call started successfully");
        callStarted = true;
        callStartTime = Date.now();
        setCallStatus("connected");
        setStatusMessage("Connected - speak now");
        onCallStart?.();
      });

      vapi.on("call-start-failed" as any, (error: any) => {
        console.error("[TestCallButton] Call start failed:", error);
        const stage = error?.stage || "unknown";
        const errorMsg = error?.message || error?.error?.message || "Connection failed";
        
        setCallStatus("error");
        setStatusMessage(`Failed at ${stage}: ${errorMsg.substring(0, 80)}`);
        setShowPhoneOnly(true);
      });

      // Fallback for older SDK versions - use call-start event
      vapi.on("call-start", () => {
        if (!callStarted) {
          console.log("[TestCallButton] Call started (fallback event)");
          callStarted = true;
          callStartTime = Date.now();
          setCallStatus("connected");
          setStatusMessage("Connected - speak now");
          onCallStart?.();
        }
      });

      vapi.on("call-end", () => {
        const callDuration = callStartTime ? (Date.now() - callStartTime) / 1000 : 0;
        console.log(`[TestCallButton] Call ended - started: ${callStarted}, duration: ${callDuration}s, AI spoke: ${aiSpoke}`);
        
        setCallStatus("idle");
        setStatusMessage("");
        
        // Only show "Test Complete" if there was a real conversation
        // (AI spoke OR call lasted more than 5 seconds)
        if (callStarted && (aiSpoke || callDuration > 5)) {
          onCallEnd?.();
        } else if (callStarted) {
          // Call connected but ended immediately without conversation
          setStatusMessage("Call disconnected too quickly. Try calling the phone number instead.");
          setShowPhoneOnly(true);
        }
      });

      vapi.on("speech-start", () => {
        console.log("[TestCallButton] AI speaking");
        aiSpoke = true;
        setCallStatus("speaking");
        setStatusMessage("AI is speaking...");
      });

      vapi.on("speech-end", () => {
        console.log("[TestCallButton] AI stopped speaking");
        setCallStatus("listening");
        setStatusMessage("Listening...");
      });

      vapi.on("error", (error) => {
        console.error("Vapi error:", error);
        setCallStatus("error");
        
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

  // In sandboxed iframe, show phone-first UI
  if (inSandbox && phoneNumber) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Call your AI receptionist to test it:
          </p>
        </div>
        
        <a href={`tel:${phoneNumber}`} className="w-full">
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

  if (inSandbox && !phoneNumber) {
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
