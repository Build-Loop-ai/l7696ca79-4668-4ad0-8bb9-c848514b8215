import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface DemoAudioPlayerProps {
  audioContent: string;
  transcript: string;
  businessName: string;
  onReset: () => void;
}

const DemoAudioPlayer = ({
  audioContent,
  transcript,
  businessName,
  onReset,
}: DemoAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={`data:audio/mpeg;base64,${audioContent}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Player Header */}
      <div className="flex items-center gap-4">
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center"
          animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
        >
          <Volume2 className="w-7 h-7 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg font-medium text-white">{businessName}</h3>
          <p className="text-sm text-white/50">AI Receptionist Preview</p>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="relative h-20 rounded-2xl overflow-hidden bg-white/5">
        {/* Animated waveform bars */}
        <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-4">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-teal/60 to-teal"
              animate={isPlaying ? {
                height: ["30%", `${40 + Math.sin(i * 0.3) * 30}%`, "30%"],
              } : {
                height: `${25 + Math.sin(i * 0.5) * 20}%`,
              }}
              transition={isPlaying ? {
                duration: 0.4 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.02,
              } : {}}
              style={{
                opacity: (i / 50) * 100 < progress ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        
        {/* Progress overlay */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-teal/10"
          style={{ width: `${progress}%` }}
        />
        
        {/* Playhead */}
        <motion.div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-white/50">
        <span>{formatTime((progress / 100) * duration)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={restart}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)",
            boxShadow: "0 8px 32px hsla(166, 76%, 36%, 0.4)",
          }}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-white" />
          ) : (
            <Play className="w-7 h-7 text-white ml-1" />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Transcript */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
          What your AI said
        </h4>
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
          {transcript}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 pt-2">
        <Link to="/signup" className="block">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              className="w-full h-14 text-base font-medium rounded-xl relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </Link>
        
        <button
          onClick={onReset}
          className="w-full py-3 text-sm font-medium text-white/60 hover:text-white transition-colors"
        >
          Try a different voice
        </button>
      </div>

      {/* Social Proof */}
      <p className="text-center text-sm text-white/40">
        Join 500+ businesses using AI receptionists
      </p>
    </div>
  );
};

export default DemoAudioPlayer;