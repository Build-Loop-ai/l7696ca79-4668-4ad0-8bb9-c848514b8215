import { useState, useMemo, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Phone, Building2, Clock, Users, Calendar, ArrowLeft, ArrowRight, 
  CheckCircle2, Sparkles, Mail, TrendingUp, DollarSign, Timer, Moon,
  AlertCircle, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

// Question definitions
const questions = [
  {
    id: "callVolume",
    question: "How many phone calls does your business receive per day?",
    icon: Phone,
    options: [
      { value: "low", label: "Less than 10", calls: 5 },
      { value: "medium", label: "10-30", calls: 20 },
      { value: "high", label: "30-50", calls: 40 },
      { value: "very_high", label: "50+", calls: 60 },
    ],
  },
  {
    id: "missedCalls",
    question: "How often do you miss calls during busy hours or after-hours?",
    icon: AlertCircle,
    options: [
      { value: "rarely", label: "Rarely", missRate: 0.05 },
      { value: "sometimes", label: "A few times a week", missRate: 0.15 },
      { value: "often", label: "Daily", missRate: 0.25 },
      { value: "frequent", label: "Multiple times per day", missRate: 0.4 },
    ],
  },
  {
    id: "afterHours",
    question: "Do callers try to reach you outside business hours?",
    icon: Moon,
    options: [
      { value: "never", label: "Never", afterHoursRate: 0 },
      { value: "sometimes", label: "Sometimes", afterHoursRate: 0.15 },
      { value: "frequently", label: "Frequently", afterHoursRate: 0.3 },
      { value: "very_often", label: "Very often", afterHoursRate: 0.45 },
    ],
  },
  {
    id: "staffTime",
    question: "How much time does your staff spend answering routine calls?",
    icon: Timer,
    options: [
      { value: "minimal", label: "Less than 1 hour/day", hours: 0.5 },
      { value: "moderate", label: "1-2 hours/day", hours: 1.5 },
      { value: "significant", label: "2-4 hours/day", hours: 3 },
      { value: "extensive", label: "4+ hours/day", hours: 5 },
    ],
  },
  {
    id: "bookingMethod",
    question: "How do customers currently book appointments?",
    icon: Calendar,
    options: [
      { value: "phone_only", label: "Phone only", automationPotential: 0.8 },
      { value: "phone_online", label: "Phone + Online", automationPotential: 0.5 },
      { value: "mostly_online", label: "Mostly online", automationPotential: 0.3 },
      { value: "walkins", label: "Walk-ins", automationPotential: 0.2 },
    ],
  },
  {
    id: "businessType",
    question: "What type of business are you?",
    icon: Building2,
    options: [
      { value: "dental_clinic", label: "Dental Clinic", avgValue: 150 },
      { value: "medical_practice", label: "Medical Practice", avgValue: 120 },
      { value: "salon", label: "Salon / Spa", avgValue: 80 },
      { value: "restaurant", label: "Restaurant", avgValue: 50 },
      { value: "other", label: "Other Service Business", avgValue: 100 },
    ],
  },
];

const steps = [
  { icon: Phone, label: "Calls" },
  { icon: AlertCircle, label: "Missed" },
  { icon: Moon, label: "Hours" },
  { icon: Timer, label: "Time" },
  { icon: Calendar, label: "Booking" },
  { icon: Building2, label: "Business" },
  { icon: Mail, label: "Results" },
];

interface Answers {
  [key: string]: string;
}

interface Insights {
  missedCallsPerMonth: number;
  potentialRevenueLost: number;
  staffHoursSaved: number;
  afterHoursOpportunity: number;
}

export default function Assessment() {
  const navigate = useNavigate();
  const { config: siteConfig } = useSiteConfigTransformed();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);

  const currentQuestion = questions[step];
  const isEmailStep = step === questions.length;
  const isComplete = showResults;

  // Calculate insights based on answers
  const calculateInsights = useCallback((): Insights => {
    const callVolumeOption = questions[0].options.find(o => o.value === answers.callVolume);
    const missedOption = questions[1].options.find(o => o.value === answers.missedCalls);
    const afterHoursOption = questions[2].options.find(o => o.value === answers.afterHours);
    const staffTimeOption = questions[3].options.find(o => o.value === answers.staffTime);
    const businessOption = questions[5].options.find(o => o.value === answers.businessType);

    const dailyCalls = (callVolumeOption as any)?.calls || 20;
    const missRate = (missedOption as any)?.missRate || 0.15;
    const afterHoursRate = (afterHoursOption as any)?.afterHoursRate || 0.15;
    const staffHoursPerDay = (staffTimeOption as any)?.hours || 1.5;
    const avgCustomerValue = (businessOption as any)?.avgValue || 100;

    const missedCallsPerMonth = Math.round(dailyCalls * missRate * 30);
    const potentialRevenueLost = Math.round(missedCallsPerMonth * avgCustomerValue * 0.3); // 30% conversion
    const staffHoursSaved = Math.round(staffHoursPerDay * 22); // 22 work days
    const afterHoursOpportunity = Math.round(dailyCalls * afterHoursRate * 30);

    return {
      missedCallsPerMonth,
      potentialRevenueLost,
      staffHoursSaved,
      afterHoursOpportunity,
    };
  }, [answers]);

  // Validate answers for consistency
  const validateAnswers = useCallback((): boolean => {
    // Check for inconsistencies
    if (answers.callVolume === "low" && answers.missedCalls === "frequent") {
      // Low calls but missing many - slightly suspicious but possible
      return true;
    }
    if (answers.callVolume === "low" && answers.staffTime === "extensive") {
      // Low calls but high staff time - inconsistent
      return false;
    }
    return true;
  }, [answers]);

  const canProceed = useMemo(() => {
    if (isEmailStep) {
      return email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    return !!answers[currentQuestion?.id];
  }, [step, answers, email, currentQuestion, isEmailStep]);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else if (step === questions.length - 1) {
      // Moving to email step - validate first
      if (!validateAnswers()) {
        toast.error("Some of your answers seem inconsistent. Please review and try again.");
        setStep(0);
        return;
      }
      setStep(questions.length);
    } else if (isEmailStep && canProceed) {
      // Submit and show results
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const calculatedInsights = calculateInsights();
    setInsights(calculatedInsights);

    try {
      const { error } = await supabase.from("assessment_leads" as any).insert({
        email: email.trim(),
        company_name: companyName.trim() || null,
        answers,
        insights: calculatedInsights,
      } as any);

      if (error) throw error;

      setShowResults(true);
      toast.success("Your personalized insights are ready!");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed && !isSubmitting) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canProceed, isSubmitting, step]);

  return (
    <>
      <Helmet>
        <title>Business Assessment | {siteConfig?.name || "AI Receptionist"}</title>
        <meta name="description" content="Discover how much an AI receptionist could save your business. Take our free 2-minute assessment." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px]"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "-10%", left: "-10%" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px]"
            animate={{
              x: [0, -80, 0],
              y: [0, 80, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "-5%", right: "-5%" }}
          />
        </div>

        {/* Floating Nav */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center justify-center gap-6 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
            <button 
              onClick={() => navigate("/")}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Home
            </button>
            <span className="text-white font-medium">{siteConfig?.name || "AI Receptionist"}</span>
            <button 
              onClick={() => navigate("/signup")}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Side - Progress & Info */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 max-w-md"
            >
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4"
                >
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-teal-400">Free Business Assessment</span>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Discover Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    Growth Potential
                  </span>
                </h1>
                <p className="text-white/60">
                  Answer 6 quick questions to see how much an AI receptionist could transform your business.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === step || (i === steps.length - 1 && showResults);
                  const isCompleted = i < step || showResults;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isActive 
                          ? "bg-teal-500/10 border border-teal-500/30" 
                          : isCompleted
                          ? "bg-white/5 border border-white/10"
                          : "opacity-40"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? "bg-teal-500" : isActive ? "bg-teal-500/20" : "bg-white/10"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-white/40"}`} />
                        )}
                      </div>
                      <span className={`text-sm ${isActive ? "text-white" : "text-white/60"}`}>
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Side - Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 flex justify-center"
            >
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-[320px] md:w-[360px] h-[640px] md:h-[700px] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-[3rem] p-3 shadow-2xl border border-white/10">
                  {/* Phone Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
                  
                  {/* Phone Screen */}
                  <div className="w-full h-full bg-gradient-to-b from-[#0f0f1a] to-[#0a0a12] rounded-[2.5rem] overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      {isComplete ? (
                        /* Results Screen */
                        <motion.div
                          key="results"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 h-full flex flex-col"
                        >
                          <div className="text-center mb-3">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.2 }}
                              className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center"
                            >
                              <Sparkles className="w-6 h-6 text-white" />
                            </motion.div>
                            <h2 className="text-lg font-bold mb-1">Your Results</h2>
                            <p className="text-xs text-white/60">Here's what you could gain</p>
                          </div>

                          <div className="space-y-2 flex-1">
                            {/* Missed Calls */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-red-400" />
                                <div className="text-lg font-bold text-red-400">~{insights?.missedCallsPerMonth}</div>
                                <div className="text-xs text-white/60">missed calls/mo</div>
                              </div>
                            </motion.div>

                            {/* Revenue */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-amber-400" />
                                <div className="text-lg font-bold text-amber-400">€{insights?.potentialRevenueLost?.toLocaleString()}+</div>
                                <div className="text-xs text-white/60">at risk</div>
                              </div>
                            </motion.div>

                            {/* Staff Hours */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-teal-400" />
                                <div className="text-lg font-bold text-teal-400">{insights?.staffHoursSaved} hrs</div>
                                <div className="text-xs text-white/60">saved/mo</div>
                              </div>
                            </motion.div>

                            {/* After Hours */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <Moon className="w-4 h-4 text-purple-400" />
                                <div className="text-lg font-bold text-purple-400">{insights?.afterHoursOpportunity}</div>
                                <div className="text-xs text-white/60">after-hours captured</div>
                              </div>
                            </motion.div>
                          </div>

                          {/* CTAs */}
                          <div className="mt-3 space-y-2">
                            <Button
                              onClick={() => navigate("/signup")}
                              className="w-full h-10 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-sm font-medium rounded-xl"
                            >
                              Start Free Trial
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              onClick={() => navigate("/demo")}
                              variant="ghost"
                              className="w-full h-10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-sm"
                            >
                              Hear Your AI First
                            </Button>
                          </div>
                        </motion.div>
                      ) : isEmailStep ? (
                        /* Email Capture Step */
                        <motion.div
                          key="email"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-6 h-full flex flex-col"
                        >
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="text-center mb-8">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center"
                              >
                                <TrendingUp className="w-8 h-8 text-teal-400" />
                              </motion.div>
                              <h2 className="text-xl font-bold mb-2">Almost There!</h2>
                              <p className="text-sm text-white/60">
                                Enter your email to see your personalized insights
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-white/60 mb-2 block">Email *</label>
                                <Input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="you@company.com"
                                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-white/60 mb-2 block">Company (optional)</label>
                                <Input
                                  type="text"
                                  value={companyName}
                                  onChange={(e) => setCompanyName(e.target.value)}
                                  placeholder="Your business name"
                                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                />
                              </div>
                            </div>

                            <p className="text-xs text-white/40 text-center mt-4">
                              We'll send your detailed report to this email
                            </p>
                          </div>

                          {/* Navigation */}
                          <div className="flex gap-3 mt-6">
                            <Button
                              onClick={handleBack}
                              variant="ghost"
                              className="flex-1 h-12 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                            <Button
                              onClick={handleNext}
                              disabled={!canProceed || isSubmitting}
                              className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl"
                            >
                              {isSubmitting ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                                />
                              ) : (
                                <>
                                  See Results
                                  <Sparkles className="w-4 h-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        /* Question Steps */
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-6 h-full flex flex-col"
                        >
                          {/* Question Header */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 text-teal-400 text-sm mb-3">
                              <span>Question {step + 1}</span>
                              <span className="text-white/40">of {questions.length}</span>
                            </div>
                            <h2 className="text-lg font-semibold leading-relaxed">
                              {currentQuestion.question}
                            </h2>
                          </div>

                          {/* Options */}
                          <div className="flex-1 space-y-3">
                            {currentQuestion.options.map((option, i) => {
                              const isSelected = answers[currentQuestion.id] === option.value;
                              return (
                                <motion.button
                                  key={option.value}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  onClick={() => handleAnswer(option.value)}
                                  className={`w-full p-4 rounded-xl text-left transition-all ${
                                    isSelected
                                      ? "bg-teal-500/20 border-2 border-teal-500"
                                      : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      isSelected ? "border-teal-500 bg-teal-500" : "border-white/30"
                                    }`}>
                                      {isSelected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-2 h-2 bg-white rounded-full"
                                        />
                                      )}
                                    </div>
                                    <span className={isSelected ? "text-white" : "text-white/80"}>
                                      {option.label}
                                    </span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>

                          {/* Navigation */}
                          <div className="flex gap-3 mt-6">
                            {step > 0 && (
                              <Button
                                onClick={handleBack}
                                variant="ghost"
                                className="flex-1 h-12 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
                              >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                              </Button>
                            )}
                            <Button
                              onClick={handleNext}
                              disabled={!canProceed}
                              className={`h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl ${
                                step === 0 ? "w-full" : "flex-1"
                              }`}
                            >
                              Continue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}