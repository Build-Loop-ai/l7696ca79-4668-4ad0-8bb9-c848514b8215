import { useState } from "react";
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

export function TestCallButton({
  assistantId,
  disabled = false,
  onCallStart,
  onCallEnd,
  phoneNumber,
}: TestCallButtonProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showBrowserCall, setShowBrowserCall] = useState(false);
  
  const publicKey = "3d8f4267-671a-4a72-924e-79ac9179df8f";

  const startTestCall = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusMessage("Your browser doesn't support microphone access");
      return;
    }

    if (!assistantId) {
      setStatusMessage("No AI assistant configured yet");
      return;
    }

    setCallStatus("connecting");
    setStatusMessage("Requesting microphone access...");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatusMessage("Connecting to AI...");

      resetVapiClient();
      const vapi = getVapiClient(publicKey);

      let callStarted = false;
      let aiSpoke = false;
      let callStartTime: number | null = null;

      vapi.on("call-start", () => {
        console.log("[TestCallButton] Call started");
        callStarted = true;
        callStartTime = Date.now();
        setCallStatus("connected");
        setStatusMessage("Connected - speak now");
        onCallStart?.();
      });

      vapi.on("call-end", () => {
        const duration = callStartTime ? (Date.now() - callStartTime) / 1000 : 0;
        console.log(`[TestCallButton] Call ended - duration: ${duration}s, AI spoke: ${aiSpoke}`);
        
        setCallStatus("idle");
        setStatusMessage("");
        
        if (callStarted && (aiSpoke || duration > 5)) {
          onCallEnd?.();
        } else if (callStarted) {
          setStatusMessage("Call ended quickly. If you didn't hear anything, try calling the phone number.");
        }
      });

      vapi.on("speech-start", () => {
        aiSpoke = true;
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
        setStatusMessage("Connection error. Try calling the phone number instead.");
      });

      await vapi.start(assistantId);
    } catch (error: any) {
      console.error("Error starting call:", error);
      setCallStatus("error");
      
      if (error.name === "NotAllowedError") {
        setStatusMessage("Microphone access denied. Please allow access and try again.");
      } else {
        setStatusMessage("Failed to start call. Try calling the phone number.");
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
    onCallEnd?.();
  };

  const isActive = callStatus !== "idle" && callStatus !== "error";

  // Primary UI: Phone number call (always works)
  if (phoneNumber && !showBrowserCall) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <a href={`tel:${phoneNumber}`} className="w-full">
          <Button variant="hero" size="lg" className="gap-2 w-full">
            <Phone className="w-5 h-5" />
            Call {phoneNumber}
          </Button>
        </a>
        
        <p className="text-xs text-muted-foreground text-center">
          Call your AI receptionist to test it
        </p>

        <button
          onClick={() => setShowBrowserCall(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
          disabled={!assistantId}
        >
          Or try browser-based call
        </button>
      </div>
    );
  }

  // No phone number yet
  if (!phoneNumber && !showBrowserCall) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Button 
          onClick={() => setShowBrowserCall(true)}
          disabled={disabled || !assistantId}
          variant="hero"
          size="lg"
          className="gap-2"
        >
          <Phone className="w-5 h-5" />
          Test Your AI
        </Button>
        {!assistantId && (
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Complete the setup to test your AI assistant
          </p>
        )}
      </div>
    );
  }

  // Browser-based call UI
  return (
    <div className="flex flex-col items-center gap-4">
      {!isActive ? (
        <>
          <Button
            onClick={startTestCall}
            disabled={disabled || !assistantId}
            variant="hero"
            size="lg"
            className="gap-2"
          >
            <Mic className="w-5 h-5" />
            {callStatus === "error" ? "Try Again" : "Start Browser Call"}
          </Button>
          
          {phoneNumber && (
            <button
              onClick={() => setShowBrowserCall(false)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Back to phone call
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
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
            
            {isActive && callStatus !== "connecting" && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            )}
          </div>

          <Button onClick={endCall} variant="destructive" size="lg" className="gap-2">
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
    </div>
  );
}

export default TestCallButton;
