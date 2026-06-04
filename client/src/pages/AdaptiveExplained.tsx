import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Clock,
  TrendingUp,
  Zap,
  Network,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Cpu,
  BarChart3,
  Lightbulb,
} from "lucide-react";

export default function AdaptiveExplained() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Adaptive Learning Engine</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Next-Generation Personalization
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            How Python Edition transforms your learning journey using advanced educational technology and AI
          </p>
        </div>

        {/* IRT Model */}
        <GlassCard variant="gradient" className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-primary/20 border border-primary/30">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Item Response Theory (IRT)</h2>
              <p className="text-muted-foreground">Psychometric model for precise ability estimation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">How It Works</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                IRT estimates your ability (θ) based on your responses to quiz items. Each item has a
                difficulty parameter (b) and discrimination parameter (a), enabling precise tracking of your skill level.
              </p>
              <div className="space-y-3">
                {[
                  "θ ranges from -3 (beginner) to +3 (expert)",
                  "Probability correct = 1 / (1 + e^(-a(θ-b)))",
                  "Ability updates after each response",
                  "More accurate than simple percentage scores",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Ability Scale Visualization</h3>
              <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-6 rounded-full mb-6 shadow-lg" />
              <div className="flex justify-between text-sm text-muted-foreground mb-6">
                <span className="font-medium">Beginner (-3)</span>
                <span className="font-medium">Intermediate (0)</span>
                <span className="font-medium">Expert (+3)</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                  <span className="text-sm font-medium">Your current ability</span>
                  <span className="font-bold text-2xl text-primary">0.00</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                  <span className="text-sm font-medium">Target difficulty</span>
                  <span className="font-bold text-2xl text-accent">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Topic-Level Mastery */}
        <GlassCard variant="elevated" className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Topic-Level Mastery Engine</h2>
              <p className="text-muted-foreground">Track mastery per concept, not globally</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Mastery Score", desc: "Composite score (0-100) from theta, practice, retention, and error frequency", color: "text-primary" },
              { title: "Confidence Score", desc: "Estimate of how confident you are based on response patterns", color: "text-blue-400" },
              { title: "Retention Score", desc: "Predicted retention based on spaced repetition data", color: "text-green-400" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-muted/50 border border-border">
                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Mastery Decay Algorithm
            </h4>
            <p className="text-muted-foreground mb-4">
              Mastery decays over time using exponential decay. The decay factor personalizes based on
              your performance - better performance = slower decay.
            </p>
            <div className="bg-background p-4 rounded-lg border border-border font-mono text-sm">
              <code className="text-primary">decayed_mastery = current_mastery × decay_factor^(days_since / 7)</code>
            </div>
          </div>
        </GlassCard>

        {/* Spaced Repetition */}
        <GlassCard variant="bordered" className="p-8 border-orange-500/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-orange-500/20 border border-orange-500/30">
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Advanced Spaced Repetition (SM-2)</h2>
              <p className="text-muted-foreground">Optimized review scheduling for long-term retention</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Enhanced SM-2 Algorithm</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Based on SuperMemo 2 with personalized forgetting curves and retention prediction.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Retention Prediction", desc: "Predicts likelihood of remembering at next review date" },
                  { title: "Confidence Prediction", desc: "Estimates confidence based on quality and repetitions" },
                  { title: "Personalized Forgetting Curve", desc: "Adapts based on your historical retention patterns" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Forgetting Curve Visualization</h3>
              <div className="p-6 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Retention follows exponential decay: <code className="text-primary">R = e^(-k × t)</code>
                </p>
                <div className="space-y-3">
                  {[
                    { day: "Day 0", pct: 100, color: "bg-green-500" },
                    { day: "Day 7", pct: 67, color: "bg-blue-500" },
                    { day: "Day 14", pct: 45, color: "bg-yellow-500" },
                    { day: "Day 30", pct: 30, color: "bg-orange-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-full bg-background rounded-full h-3">
                        <div className={`${item.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="text-xs w-16 font-medium">{item.day}: {item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Learning Velocity */}
        <GlassCard variant="elevated" className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/30">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Learning Velocity</h2>
              <p className="text-muted-foreground">Measure your speed of improvement</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Accelerating", desc: "Fast improvement", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { label: "Stable", desc: "Consistent progress", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Struggling", desc: "Needs support", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { label: "Expert", desc: "Mastery achieved", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-xl text-center ${item.bg} ${item.border}`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-semibold text-lg mb-4">Velocity Metrics</h4>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Improvement Rate", desc: "Theta change per week" },
                { title: "Challenge Success Trend", desc: "Last 10 challenge success rates" },
                { title: "Quiz Trend", desc: "Last 10 quiz scores" },
                { title: "Retention Trend", desc: "Last 10 retention estimates" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                  <p className="font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Knowledge Graph */}
        <GlassCard variant="default" className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-pink-500/20 border border-pink-500/30">
              <Network className="w-8 h-8 text-pink-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Knowledge Graph</h2>
              <p className="text-muted-foreground">Concept relationships and prerequisite tracking</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">How It Works</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The knowledge graph defines relationships between Python concepts. It ensures you learn
                topics in the right order.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Prerequisite Checking", desc: "Verifies mastery before unlocking advanced topics" },
                  { title: "Automatic Recommendations", desc: "Suggests prerequisite review when mastery is weak" },
                  { title: "Concept Blocking", desc: "Blocks advanced topics if prerequisites aren't mastered" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Example Learning Path</h3>
              <div className="p-6 rounded-xl bg-muted/50 border border-border">
                <div className="space-y-3">
                  {[
                    { color: "bg-green-500", label: "Variables" },
                    { color: "bg-blue-500", label: "Data Types" },
                    { color: "bg-purple-500", label: "Operators" },
                    { color: "bg-orange-500", label: "Conditions" },
                    { color: "bg-pink-500", label: "Loops" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      <span className="font-medium">{item.label}</span>
                      {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Learning Style */}
        <GlassCard variant="default" className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Learning Style Model</h2>
              <p className="text-muted-foreground">Adapts to how you learn best</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Theory-Oriented", desc: "Prefers detailed explanations before practice", color: "text-indigo-400" },
              { title: "Hands-On", desc: "Learns best by coding and solving problems", color: "text-cyan-400" },
              { title: "Guided", desc: "Benefits from step-by-step AI assistance", color: "text-pink-400" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-muted/50 border border-border">
                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="font-semibold text-lg mb-4">Behavior Tracking</h4>
            <p className="text-muted-foreground mb-4">
              Learning style is inferred from your behavior patterns:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Time spent on theory vs practice",
                "AI usage frequency",
                "Quiz attempt rate",
                "Challenge attempt rate",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Adaptive AI Tutor */}
        <GlassCard variant="glow" className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-500/30">
              <Brain className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Adaptive AI Tutor</h2>
              <p className="text-muted-foreground">Personalized tutoring based on your profile</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Context Awareness</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The AI tutor knows your complete learning profile to provide personalized guidance.
              </p>
              <div className="space-y-3">
                {[
                  "Current theta and ability level",
                  "Topic mastery map",
                  "Weak and strong topics",
                  "Learning velocity classification",
                  "Learning style profile",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Adaptive Behavior</h3>
              <div className="space-y-4">
                {[
                  { level: "Beginner/Struggling", desc: "Detailed explanations, step-by-step guidance, extra examples", color: "border-orange-500/30 bg-orange-500/5" },
                  { level: "Intermediate/Stable", desc: "Balanced explanations, targeted hints, moderate challenge", color: "border-blue-500/30 bg-blue-500/5" },
                  { level: "Advanced/Expert", desc: "Concise explanations, challenge-oriented coaching, minimal guidance", color: "border-green-500/30 bg-green-500/5" },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${item.color}`}>
                    <p className="font-medium text-sm">{item.level}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Summary */}
        <GlassCard variant="gradient" className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Complete Adaptive System</h2>
            <p className="text-muted-foreground">All components working together for personalized learning</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "IRT Model", desc: "Psychometric ability estimation", color: "text-primary" },
              { icon: Brain, title: "Topic Mastery", desc: "Per-concept tracking with decay", color: "text-blue-400" },
              { icon: Clock, title: "Spaced Repetition", desc: "Enhanced SM-2 with predictions", color: "text-orange-400" },
              { icon: Zap, title: "Learning Velocity", desc: "Improvement speed tracking", color: "text-purple-400" },
              { icon: Network, title: "Knowledge Graph", desc: "Concept relationships", color: "text-pink-400" },
              { icon: BookOpen, title: "Learning Style", desc: "Behavior-based adaptation", color: "text-indigo-400" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                <p className="font-semibold mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Technical Highlights */}
        <GlassCard variant="elevated" className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Technical Implementation</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Built with Modern Technologies</h2>
            <p className="text-muted-foreground">Enterprise-grade architecture for scalability and performance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: "Data-Driven", desc: "Real-time analytics and metrics" },
              { icon: Sparkles, title: "AI-Powered", desc: "Intelligent recommendations" },
              { icon: Award, title: "Gamified", desc: "XP, levels, and achievements" },
              { icon: TrendingUp, title: "Scalable", desc: "Built for growth" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-muted/50 border border-border">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </Layout>
  );
}
