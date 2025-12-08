import { motion } from "framer-motion";

export const ConnectVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-transparent to-teal/5">
    {/* Animated connection lines background */}
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        viewport={{ once: true }}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
    
    <div className="relative flex items-center gap-4 md:gap-6">
      {/* Your Phone */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-teal flex items-center justify-center shadow-xl shadow-primary/30">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center"
        >
          <span className="text-[10px]">📱</span>
        </motion.div>
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap font-medium">Your Phone</p>
      </motion.div>
      
      {/* Connection animation */}
      <div className="relative flex items-center">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-10 md:w-16 h-0.5 bg-gradient-to-r from-primary to-teal rounded-full origin-left"
        />
        <motion.div
          animate={{ x: [0, 24, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-teal shadow-lg shadow-teal/50"
        />
      </div>
      
      {/* AI Assistant */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
        className="relative"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-teal via-teal to-primary flex items-center justify-center shadow-xl shadow-teal/30">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-teal flex items-center justify-center"
        >
          <span className="text-[10px]">🤖</span>
        </motion.div>
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap font-medium">AI Receptionist</p>
      </motion.div>
    </div>
  </div>
);

export const CustomizeVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-teal/5 via-transparent to-primary/5">
    <div className="w-full max-w-[280px] space-y-4">
      {/* Voice selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-background rounded-2xl p-4 border border-border/50 shadow-xl shadow-primary/5"
      >
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Voice</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block">Sophie</span>
            <span className="text-xs text-muted-foreground">Dutch • Friendly</span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-auto w-3 h-3 rounded-full bg-success"
          />
        </div>
      </motion.div>
      
      {/* Language selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-background rounded-2xl p-4 border border-border/50 shadow-xl shadow-primary/5"
      >
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Language</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-background to-muted border border-border flex items-center justify-center text-2xl">
            🇳🇱
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block">Nederlands</span>
            <span className="text-xs text-muted-foreground">22+ languages available</span>
          </div>
        </div>
      </motion.div>
      
      {/* Personality slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="bg-background rounded-2xl p-4 border border-border/50 shadow-xl shadow-primary/5"
      >
        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Personality</div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "70%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary via-teal to-primary rounded-full relative"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-2 border-primary shadow-lg" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">Professional</span>
          <span className="text-xs text-primary font-medium">Friendly</span>
        </div>
      </motion.div>
    </div>
  </div>
);

export const LaunchVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-success/5 via-transparent to-primary/5">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, type: "spring" }}
      className="relative w-full max-w-[280px]"
    >
      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-success text-success-foreground px-4 py-1.5 rounded-full shadow-lg shadow-success/30"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-foreground opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success-foreground"></span>
        </span>
        <span className="text-xs font-bold tracking-wider">LIVE</span>
      </motion.div>
      
      {/* Dashboard preview */}
      <div className="bg-background rounded-3xl border border-border/50 shadow-2xl shadow-primary/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-foreground block">Today's Calls</span>
            <span className="text-xs text-muted-foreground">Real-time updates</span>
          </div>
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-2xl font-bold text-foreground"
          >
            12
          </motion.span>
        </div>
        
        {/* Mini chart */}
        <div className="flex items-end gap-1.5 h-20">
          {[35, 55, 25, 75, 45, 85, 65, 40, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
              className="flex-1 bg-gradient-to-t from-primary to-teal rounded-md"
            />
          ))}
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
          {[
            { label: "Booked", value: "8", color: "text-success" },
            { label: "Answered", value: "96%", color: "text-primary" },
            { label: "Avg", value: "2:34", color: "text-teal" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-muted-foreground block">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);
