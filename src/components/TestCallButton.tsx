import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, Mic, Volume2 } from "lucide-react";
import { getVapiClient, resetVapiClient } from "@/lib/vapi-client";
import { cn } from "@/lib/utils";

interface TestCallButtonProps {
  assistantId?: string;
  disabled?: boolean;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

type CallStatus = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error";

export function TestCallButton({
  assistantId,
  disabled = false,
  onCallStart,
  onCallEnd,
}: TestCallButtonProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

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
    if (!publicKey) {
      setCallStatus("error");
      setStatusMessage("Vapi public key not configured");
      return;
    }

    if (!assistantId) {
      setCallStatus("error");
      setStatusMessage("No AI assistant configured yet");
      return;
    }

    setCallStatus("connecting");
    setStatusMessage("Connecting...");

    try {
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
        setStatusMessage("Call error occurred");
      });

      await vapi.start(assistantId);
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("error");
      setStatusMessage("Failed to start call");
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isActive && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          {callStatus === "error" && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
          {statusMessage}
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
