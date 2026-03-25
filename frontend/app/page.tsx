"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Terminal,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Users,
  Zap,
  Brain,
  ChevronRight,
  Command
} from "lucide-react"

// Types
interface Report {
  subject: string
  executive_summary: string
  competitors_or_key_players: string[]
  strengths_or_advantages: string[]
  weaknesses_or_challenges: string[]
  strategic_insights: string[]
}

interface AppState {
  query: string
  loading: boolean
  logs: string[]
  report: Report | null
  error: string
}

export default function ResearchAgentDashboard() {
  const [state, setState] = useState<AppState>({
    query: "",
    loading: false,
    logs: [],
    report: null,
    error: ""
  })

  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [state.logs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.query.trim()) return

    setState(prev => ({
      ...prev,
      loading: true,
      logs: [],
      report: null,
      error: ""
    }))

    // Simulate initial connection logs
    const simulatedLogs = [
      "[INIT] Autonomous Research Agent v2.1.0 initialized",
      `[QUERY] "${state.query}"`,
      "[AGENT] Connecting to Python backend and spawning research threads...",
    ]

    for (let i = 0; i < simulatedLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setState(prev => ({
        ...prev,
        logs: [...prev.logs, simulatedLogs[i]]
      }))
    }

    try {
        const response = await fetch("https://ai-research-platform.onrender.com/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: state.query })
      })

      const data = await response.json()
      console.log("Raw response from Python:", data)

      if (data.status === "error") {
        throw new Error(data.message || "Backend agent error")
      }

      // Fix stringified JSON from the LLM
      let finalReport = data.report;
      if (typeof finalReport === "string") {
        try {
          finalReport = JSON.parse(finalReport);
        } catch (parseError) {
          console.error("Could not parse stringified JSON:", parseError);
        }
      }

      setState(prev => ({
        ...prev,
        // If your backend sends real logs, we append them here
        logs: [...prev.logs, ...((data.logs as string[]) || []), "[DONE] Research complete. Report generated."],
        loading: false,
        report: finalReport
      }))

    } catch (err: any) {
      console.error("Fetch Error:", err)
      setState(prev => ({
        ...prev,
        logs: [...prev.logs, `[ERROR] ${err.message || "Connection failed"}`],
        loading: false,
        error: err.message || "Failed to connect to backend. Is uvicorn running?"
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-chart-2/5 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px"
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <HeroSection />

        {/* Command Palette Search */}
        <CommandPalette
          query={state.query}
          loading={state.loading}
          onQueryChange={(query) => setState(prev => ({ ...prev, query }))}
          onSubmit={handleSubmit}
        />

        {/* Live Terminal */}
        <AnimatePresence mode="wait">
          {state.loading && (
            <LiveTerminal logs={state.logs} ref={terminalRef} />
          )}
        </AnimatePresence>

        {/* Error Display */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-3xl mx-auto p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-center"
          >
            {state.error}
          </motion.div>
        )}

        {/* Insights Dashboard */}
        <AnimatePresence mode="wait">
          {state.report && !state.loading && (
            <InsightsDashboard report={state.report} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// Hero Section Component
function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center mb-12 md:mb-16"
    >
      {/* Glowing Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-6"
      >
        <div className="relative">
          <Brain className="w-4 h-4 text-primary" />
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-sm font-medium text-primary">Intelligence Engine</span>
        <ChevronRight className="w-3 h-3 text-primary/60" />
      </motion.div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
        <span className="text-foreground">Autonomous</span>{" "}
        <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
          AI Research
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
        Enterprise-grade autonomous agent for deep market intelligence, competitive analysis, and strategic insights.
      </p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mt-8"
      >
        {[
          { icon: Zap, label: "Real-time Analysis" },
          { icon: Brain, label: "Neural Processing" },
          { icon: Users, label: "Competitor Tracking" }
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground text-sm"
          >
            <feature.icon className="w-3.5 h-3.5" />
            <span>{feature.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// Command Palette Search Component
interface CommandPaletteProps {
  query: string
  loading: boolean
  onQueryChange: (query: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function CommandPalette({ query, loading, onQueryChange, onSubmit }: CommandPaletteProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative max-w-3xl mx-auto"
    >
      {/* Glow effect container */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/50 via-chart-2/50 to-primary/50 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />

      {/* Main input container */}
      <div className="relative group">
        {/* Animated border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-chart-2/20 to-primary/20 opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50">
          {/* Command icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/80">
            <Command className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Input field */}
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What would you like to research?"
            disabled={loading}
            className="flex-1 bg-transparent text-lg md:text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
          />

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading || !query.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-primary/90"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span className="hidden sm:inline">Researching</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Research</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  )
}

// Live Terminal Component
import { forwardRef } from "react"

interface LiveTerminalProps {
  logs: string[]
}

const LiveTerminal = forwardRef<HTMLDivElement, LiveTerminalProps>(
  function LiveTerminal({ logs }, ref) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 max-w-3xl mx-auto overflow-hidden"
      >
        {/* Terminal window */}
        <div className="rounded-xl border border-border/50 bg-[oklch(0.08_0.003_285)] backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-secondary/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-chart-3/80" />
              <div className="w-3 h-3 rounded-full bg-chart-2/80" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Terminal className="w-4 h-4" />
              <span>nexus-agent — research-session</span>
            </div>
            <div className="w-16" />
          </div>

          {/* Terminal body */}
          <div
            ref={ref}
            className="p-4 md:p-6 h-64 overflow-y-auto font-mono text-sm terminal-scrollbar"
          >
            <AnimatePresence mode="popLayout">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 mb-2"
                >
                  <span className="text-chart-2 select-none">{">"}</span>
                  <span className={getLogColor(log)}>{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Blinking cursor */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-chart-2 select-none">{">"}</span>
              <motion.span
                className="w-2.5 h-5 bg-foreground animate-blink"
              />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
)

function getLogColor(log: string): string {
  if (log.includes("[INIT]")) return "text-chart-2"
  if (log.includes("[DONE]")) return "text-chart-2"
  if (log.includes("[ERROR]")) return "text-destructive"
  if (log.includes("[DEMO]")) return "text-chart-3"
  if (log.includes("[AI]") || log.includes("[AGENT]")) return "text-primary"
  return "text-muted-foreground"
}

// Insights Dashboard Component
interface InsightsDashboardProps {
  report: Report
}

function InsightsDashboard({ report }: InsightsDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 md:mt-20"
    >
      {/* Section header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-2/10 border border-chart-2/30 text-chart-2 text-sm font-medium mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Research Complete
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
          {report.subject}
        </h2>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-2 row-span-2"
        >
          <BentoCard className="h-full p-6 md:p-8" glow="primary">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">Key findings and analysis</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-balance">
              {report.executive_summary}
            </p>
          </BentoCard>
        </motion.div>

        {/* Competitors / Key Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BentoCard className="h-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-4/10">
                <Users className="w-5 h-5 text-chart-4" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Key Players</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.competitors_or_key_players?.map((player, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="px-3 py-1.5 rounded-full bg-secondary/80 border border-border/50 text-sm text-foreground"
                >
                  {player}
                </motion.span>
              ))}
            </div>
          </BentoCard>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BentoCard className="h-full p-6" glow="success">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/10">
                <CheckCircle2 className="w-5 h-5 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {report.strengths_or_advantages?.map((strength, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-chart-2 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </BentoCard>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BentoCard className="h-full p-6" glow="warning">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-3/10">
                <AlertTriangle className="w-5 h-5 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Challenges</h3>
            </div>
            <ul className="space-y-3">
              {report.weaknesses_or_challenges?.map((weakness, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-chart-3 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{weakness}</span>
                </motion.li>
              ))}
            </ul>
          </BentoCard>
        </motion.div>

        {/* Strategic Insights - Full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2 lg:col-span-3"
        >
          <BentoCard className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Strategic Insights</h3>
                <p className="text-sm text-muted-foreground">Actionable intelligence and recommendations</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.strategic_insights?.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="group relative p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {insight}
                    </p>
                  </div>
                  <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </BentoCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Bento Card Component
interface BentoCardProps {
  children: React.ReactNode
  className?: string
  glow?: "primary" | "success" | "warning"
}

function BentoCard({ children, className = "", glow }: BentoCardProps) {
  const glowStyles = {
    primary: "hover:shadow-[0_0_40px_oklch(0.65_0.2_280_/_0.15)]",
    success: "hover:shadow-[0_0_40px_oklch(0.7_0.18_160_/_0.15)]",
    warning: "hover:shadow-[0_0_40px_oklch(0.75_0.16_80_/_0.15)]"
  }

  return (
    <div
      className={`
        relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl
        transition-all duration-500 hover:border-border
        ${glow ? glowStyles[glow] : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}