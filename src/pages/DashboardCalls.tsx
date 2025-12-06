import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  FileText,
  PhoneCall,
  CheckCircle2,
  Info,
  PhoneForwarded,
  PhoneMissed,
  Search,
  Calendar,
  Download,
  Pause,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const calls = [
  {
    id: 1,
    date: "2024-03-15",
    time: "14:32",
    caller: "+31 6 1234 5678",
    duration: "2:15",
    outcome: "appointment_booked",
    transcript: [
      { speaker: "AI", text: "Good afternoon, Amsterdam Dental Care. How can I help you today?" },
      { speaker: "Caller", text: "Hi, I'd like to book an appointment for a checkup." },
      { speaker: "AI", text: "Of course! I can help you with that. Could I have your name please?" },
      { speaker: "Caller", text: "Yes, it's Maria de Jong." },
      { speaker: "AI", text: "Thank you, Maria. Let me check our availability. We have openings on Tuesday at 10 AM or Thursday at 2 PM. Which works better for you?" },
      { speaker: "Caller", text: "Thursday at 2 PM would be perfect." },
      { speaker: "AI", text: "Excellent! I've booked you for Thursday, March 21st at 2 PM with Dr. van den Berg. You'll receive a confirmation text shortly. Is there anything else I can help you with?" },
      { speaker: "Caller", text: "No, that's all. Thank you!" },
      { speaker: "AI", text: "You're welcome! Have a great day. Goodbye!" },
    ],
  },
  {
    id: 2,
    date: "2024-03-15",
    time: "14:15",
    caller: "+31 6 9876 5432",
    duration: "1:02",
    outcome: "info_provided",
    transcript: [
      { speaker: "AI", text: "Good afternoon, Amsterdam Dental Care. How can I help you today?" },
      { speaker: "Caller", text: "What are your opening hours?" },
      { speaker: "AI", text: "We're open Monday through Friday from 9 AM to 5 PM, and Saturday from 9 AM to 1 PM. We're closed on Sundays." },
      { speaker: "Caller", text: "Thanks!" },
    ],
  },
  {
    id: 3,
    date: "2024-03-15",
    time: "13:48",
    caller: "+31 6 5555 4444",
    duration: "0:45",
    outcome: "transferred",
    transcript: [
      { speaker: "AI", text: "Good afternoon, Amsterdam Dental Care. How can I help you today?" },
      { speaker: "Caller", text: "I have severe tooth pain and need to speak to a dentist immediately." },
      { speaker: "AI", text: "I understand you're in pain. Let me transfer you to our emergency line right away." },
    ],
  },
  {
    id: 4,
    date: "2024-03-15",
    time: "13:22",
    caller: "+31 6 3333 2222",
    duration: "1:58",
    outcome: "appointment_booked",
    transcript: [],
  },
  {
    id: 5,
    date: "2024-03-15",
    time: "12:55",
    caller: "+31 6 1111 0000",
    duration: "0:00",
    outcome: "missed",
    transcript: [],
  },
];

const outcomeConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  appointment_booked: {
    label: "Appointment Booked",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  info_provided: {
    label: "Info Provided",
    color: "bg-blue-100 text-blue-700",
    icon: Info,
  },
  transferred: {
    label: "Transferred",
    color: "bg-yellow-100 text-yellow-700",
    icon: PhoneForwarded,
  },
  missed: {
    label: "Missed",
    color: "bg-red-100 text-red-700",
    icon: PhoneMissed,
  },
};

const DashboardCalls = () => {
  const [selectedCall, setSelectedCall] = useState<typeof calls[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Calls</h1>
          <p className="text-muted-foreground">
            View and manage all your call recordings and transcripts.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by phone number..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                  <SelectItem value="info_provided">Info Provided</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => {
                const outcome = outcomeConfig[call.outcome];
                return (
                  <TableRow
                    key={call.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCall(call)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{call.date}</div>
                        <div className="text-sm text-muted-foreground">
                          {call.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{call.caller}</TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`gap-1 ${outcome.color}`}
                      >
                        <outcome.icon className="w-3 h-3" />
                        {outcome.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Call Detail Modal */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">Call Details</DialogTitle>
          </DialogHeader>

          {selectedCall && (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
              {/* Left side - Audio player */}
              <div className="md:w-1/2 space-y-4">
                <div className="bg-muted/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-12 h-12 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: "35%" }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>0:48</span>
                        <span>{selectedCall.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Caller</span>
                      <span className="font-mono">{selectedCall.caller}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>{selectedCall.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span>{selectedCall.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{selectedCall.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground">Outcome</span>
                      <Badge
                        variant="secondary"
                        className={`gap-1 ${outcomeConfig[selectedCall.outcome].color}`}
                      >
                        {outcomeConfig[selectedCall.outcome].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <PhoneCall className="w-4 h-4" />
                    Call Back
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Right side - Transcript */}
              <div className="md:w-1/2 flex flex-col">
                <h3 className="font-medium text-foreground mb-4">Transcript</h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          message.speaker === "AI" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                            message.speaker === "AI"
                              ? "bg-muted text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {message.speaker}
                          </p>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No transcript available for this call.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCalls;
