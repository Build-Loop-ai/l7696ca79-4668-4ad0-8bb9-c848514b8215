import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneOff, Loader2, Mic, Volume2, AlertTriangle, Calendar, MessageSquare, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { getVapiClient, resetVapiClient } from "@/lib/vapi-client";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TestCallButtonProps {
  assistantId?: string;
  disabled?: boolean;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  phoneNumber?: string;
}

type CallStatus = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error";

interface ActivityEvent {
  id: string;
  type: "info" | "tool" | "speech" | "success" | "error";
  message: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface TranscriptEntry {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export function TestCallButton({
  assistantId,
  disabled = false,
  onCallStart,
  onCallEnd,
}: TestCallButtonProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  
  const publicKey = "3d8f4267-671a-4a72-924e-79ac9179df8f";

  const addActivity = (type: ActivityEvent["type"], message: string, icon?: React.ReactNode) => {
    const event: ActivityEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      icon,
    };
    setActivityLog(prev => [...prev, event]);
  };

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
    setActivityLog([]);
    setTranscript([]);
    addActivity("info", "Requesting microphone access...");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      addActivity("success", "Microphone access granted", <CheckCircle2 className="w-3 h-3" />);
      setStatusMessage("Connecting to AI...");
      addActivity("info", "Connecting to AI assistant...");

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
        addActivity("success", "Call connected successfully", <Phone className="w-3 h-3" />);
        onCallStart?.();
      });

      vapi.on("call-end", () => {
        const duration = callStartTime ? (Date.now() - callStartTime) / 1000 : 0;
        console.log(`[TestCallButton] Call ended - duration: ${duration}s, AI spoke: ${aiSpoke}`);
        
        addActivity("info", `Call ended (${duration.toFixed(1)}s)`);
        setCallStatus("idle");
        setStatusMessage("");
        
        if (callStarted && (aiSpoke || duration > 5)) {
          onCallEnd?.();
        } else if (callStarted) {
          setStatusMessage("Call ended quickly. Try speaking to the AI.");
        }
      });

      vapi.on("speech-start", () => {
        aiSpoke = true;
        setCallStatus("speaking");
        setStatusMessage("AI is speaking...");
        addActivity("speech", "AI is speaking...", <Volume2 className="w-3 h-3" />);
      });

      vapi.on("speech-end", () => {
        setCallStatus("listening");
        setStatusMessage("Listening...");
        addActivity("info", "Listening for your response...", <Mic className="w-3 h-3" />);
      });

      // Listen for messages to track tool calls and transcripts
      vapi.on("message", (message: any) => {
        console.log("[TestCallButton] Message:", JSON.stringify(message, null, 2));
        
        // Log all message types for debugging
        addActivity("info", `Event: ${message.type}`, <ArrowRight className="w-3 h-3" />);
        
        if (message.type === "tool-calls") {
          console.log("[TestCallButton] 🔧 TOOL CALLS RECEIVED:", JSON.stringify(message, null, 2));
          const toolCalls = message.toolCallList || message.toolCalls || [];
          toolCalls.forEach((tool: any) => {
            const funcName = tool.function?.name || tool.name;
            const args = tool.function?.arguments || tool.arguments;
            console.log(`[TestCallButton] Tool: ${funcName}, Args:`, args);
            if (funcName === "checkAvailability") {
              addActivity("tool", `📅 Checking availability for: ${args?.date || 'unknown date'}`, <Calendar className="w-3 h-3" />);
            } else if (funcName === "bookAppointment") {
              addActivity("tool", `📝 Booking: ${args?.patientName || 'patient'} at ${args?.time || 'time'}`, <Calendar className="w-3 h-3" />);
            } else if (funcName) {
              addActivity("tool", `Calling ${funcName}...`, <ArrowRight className="w-3 h-3" />);
            }
          });
        }
        
        if (message.type === "tool-calls-result") {
          console.log("[TestCallButton] 🔧 TOOL RESULT:", JSON.stringify(message, null, 2));
          const results = message.toolCallResult || message.results || [];
          results.forEach((result: any) => {
            try {
              const parsed = typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
              console.log("[TestCallButton] Parsed result:", parsed);
              if (parsed?._debug) {
                const debug = parsed._debug;
                addActivity("info", `📅 Checked: ${debug.requestedDate} (${debug.parsedDayOfWeek})`);
                addActivity("info", `📆 Calendar: ${debug.calendarConnected ? 'Connected' : 'Using business hours'}`);
                addActivity("info", `⏰ Slots: ${debug.slotsAfterFiltering} available of ${debug.totalSlotsGenerated} generated`);
                if (debug.reason) {
                  addActivity("info", `ℹ️ ${debug.reason}`);
                }
              }
              // Show the actual result message
              if (parsed?.message) {
                addActivity("success", `Result: ${parsed.message}`, <CheckCircle2 className="w-3 h-3" />);
              }
            } catch (e) {
              console.error("[TestCallButton] Error parsing tool result:", e);
            }
          });
          addActivity("success", "Tool call completed", <CheckCircle2 className="w-3 h-3" />);
        }

        // Detect conversation resets
        if (message.type === "conversation-update") {
          console.log("[TestCallButton] ⚠️ CONVERSATION UPDATE:", JSON.stringify(message, null, 2));
          addActivity("info", "Conversation state updated", <ArrowRight className="w-3 h-3" />);
        }

        // Full transcript tracking - both user and assistant
        if (message.type === "transcript" && message.transcriptType === "final") {
          const entry: TranscriptEntry = {
            id: `${Date.now()}-${Math.random()}`,
            role: message.role,
            text: message.transcript,
            timestamp: new Date(),
          };
          setTranscript(prev => [...prev, entry]);
          
          // Also add to activity log with full text
          if (message.role === "user") {
            addActivity("info", `You: "${message.transcript}"`, <MessageSquare className="w-3 h-3" />);
          } else {
            addActivity("speech", `AI: "${message.transcript}"`, <Volume2 className="w-3 h-3" />);
          }
        }
      });

      vapi.on("error", (error) => {
        console.error("Vapi error:", error);
        setCallStatus("error");
        addActivity("error", "Couldn't connect the browser call");
        setStatusMessage("Couldn't connect the browser call. Check your microphone and connection, or dial your AI phone number directly to test a real call.");
      });

      await vapi.start(assistantId);
    } catch (error: any) {
      console.error("Error starting call:", error);
      setCallStatus("error");
      
      if (error.name === "NotAllowedError") {
        setStatusMessage("Microphone access denied. Please allow access and try again.");
        addActivity("error", "Microphone access denied");
      } else {
        setStatusMessage("Failed to start call. Please try again.");
        addActivity("error", "Failed to start call");
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

  const getActivityIcon = (event: ActivityEvent) => {
    if (event.icon) return event.icon;
    switch (event.type) {
      case "tool": return <ArrowRight className="w-3 h-3" />;
      case "speech": return <Volume2 className="w-3 h-3" />;
      case "success": return <CheckCircle2 className="w-3 h-3" />;
      case "error": return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getActivityColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "tool": return "text-blue-500 bg-blue-500/10";
      case "speech": return "text-primary bg-primary/10";
      case "success": return "text-green-500 bg-green-500/10";
      case "error": return "text-red-500 bg-red-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
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
          
          {!assistantId && (
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Complete the setup to test your AI assistant
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
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

      {/* Full Conversation Transcript */}
      {transcript.length > 0 && (
        <div className="w-full mt-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conversation Transcript</span>
          </div>
          <ScrollArea className="h-48 w-full rounded-lg border border-primary/20 bg-background">
            <div className="p-3 space-y-3">
              {transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "p-2 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-1 duration-200",
                    entry.role === "user" 
                      ? "bg-muted ml-4" 
                      : "bg-primary/10 mr-4"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {entry.role === "user" ? (
                      <Mic className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-primary" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      {entry.role === "user" ? "You" : "AI"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-foreground break-words whitespace-pre-wrap">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Activity Log */}
      {activityLog.length > 0 && (
        <div className="w-full mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Debug Activity</span>
          </div>
          <ScrollArea className="h-32 w-full rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="p-3 space-y-2">
              {activityLog.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 text-xs animate-in fade-in slide-in-from-bottom-1 duration-200"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    getActivityColor(event.type)
                  )}>
                    {getActivityIcon(event)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "break-words",
                      event.type === "error" ? "text-red-500" : "text-foreground"
                    )}>
                      {event.message}
                    </p>
                    <p className="text-muted-foreground/60 text-[10px]">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default TestCallButton;
