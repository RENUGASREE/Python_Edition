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
} from "lucide-react";

export default function AdaptiveExplained() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-4">Adaptive Learning Engine</h1>
          <p className="text-xl text-muted-foreground">
            How Python Edition personalizes your learning journey using advanced educational technology
          </p>
        </div>

        {/* IRT Model */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/15">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Item Response Theory (IRT)</h2>
              <p className="text-muted-foreground">Psychometric model for ability estimation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">How It Works</h3>
              <p className="text-muted-foreground mb-4">
                IRT estimates your ability (θ) based on your responses to quiz items. Each item has a
                difficulty parameter (b) and discrimination parameter (a).
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">θ ranges from -3 (beginner) to +3 (expert)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Probability correct = 1 / (1 + e^(-a(θ-b)))</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Ability updates after each response</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Theta Score Visualization</h3>
              <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full mb-4" />
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>Beginner (-3)</span>
                <span>Intermediate (0)</span>
                <span>Expert (+3)</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Your current ability</span>
                  <span className="font-bold text-lg">0.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Target difficulty</span>
                  <span className="font-bold text-lg">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Topic-Level Mastery */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/15">
              <Brain className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Topic-Level Mastery Engine</h2>
              <p className="text-muted-foreground">Track mastery per concept, not globally</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Mastery Score</h4>
              <p className="text-sm text-muted-foreground">
                Composite score (0-100) from theta, practice, retention, and error frequency
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Confidence Score</h4>
              <p className="text-sm text-muted-foreground">
                Estimate of how confident you are based on response patterns
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Retention Score</h4>
              <p className="text-sm text-muted-foreground">
                Predicted retention based on spaced repetition data
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Mastery Decay</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Mastery decays over time using exponential decay. The decay factor personalizes based on
              your performance - better performance = slower decay.
            </p>
            <div className="text-sm font-mono bg-background p-3 rounded">
              decayed_mastery = current_mastery × decay_factor^(days_since / 7)
            </div>
          </div>
        </GlassCard>

        {/* Spaced Repetition */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/15">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Advanced Spaced Repetition (SM-2)</h2>
              <p className="text-muted-foreground">Optimized review scheduling for long-term retention</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Enhanced SM-2 Algorithm</h3>
              <p className="text-muted-foreground mb-4">
                Based on SuperMemo 2 with personalized forgetting curves and retention prediction.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Retention Prediction</p>
                    <p className="text-sm text-muted-foreground">
                      Predicts likelihood of remembering at next review date
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Confidence Prediction</p>
                    <p className="text-sm text-muted-foreground">
                      Estimates confidence based on quality and repetitions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Personalized Forgetting Curve</p>
                    <p className="text-sm text-muted-foreground">
                      Adapts based on your historical retention patterns
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Forgetting Curve</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Retention follows exponential decay: R = e^(-k × t)
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }} />
                    </div>
                    <span className="text-xs w-16">Day 0: 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "67%" }} />
                    </div>
                    <span className="text-xs w-16">Day 7: 67%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "45%" }} />
                    </div>
                    <span className="text-xs w-16">Day 14: 45%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: "30%" }} />
                    </div>
                    <span className="text-xs w-16">Day 30: 30%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Learning Velocity */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/15">
              <Zap className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Learning Velocity</h2>
              <p className="text-muted-foreground">Measure your speed of improvement</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-500">Accelerating</p>
              <p className="text-sm text-muted-foreground">Fast improvement</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">Stable</p>
              <p className="text-sm text-muted-foreground">Consistent progress</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">Struggling</p>
              <p className="text-sm text-muted-foreground">Needs support</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">Expert</p>
              <p className="text-sm text-muted-foreground">Mastery achieved</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Velocity Metrics</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Improvement Rate</p>
                <p className="font-medium">Theta change per week</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Challenge Success Trend</p>
                <p className="font-medium">Last 10 challenge success rates</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quiz Trend</p>
                <p className="font-medium">Last 10 quiz scores</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Retention Trend</p>
                <p className="font-medium">Last 10 retention estimates</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Knowledge Graph */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-pink-500/15">
              <Network className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Knowledge Graph</h2>
              <p className="text-muted-foreground">Concept relationships and prerequisite tracking</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">How It Works</h3>
              <p className="text-muted-foreground mb-4">
                The knowledge graph defines relationships between Python concepts. It ensures you learn
                topics in the right order.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Prerequisite Checking</p>
                    <p className="text-sm text-muted-foreground">
                      Verifies mastery before unlocking advanced topics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Automatic Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Suggests prerequisite review when mastery is weak
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Concept Blocking</p>
                    <p className="text-sm text-muted-foreground">
                      Blocks advanced topics if prerequisites aren't mastered
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Example Path</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Variables</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Data Types</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Operators</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">Conditions</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-sm">Loops</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Learning Style */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-indigo-500/15">
              <BookOpen className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Learning Style Model</h2>
              <p className="text-muted-foreground">Adapts to how you learn best</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Theory-Oriented</h4>
              <p className="text-sm text-muted-foreground">
                Prefers detailed explanations before practice
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Hands-On</h4>
              <p className="text-sm text-muted-foreground">
                Learns best by coding and solving problems
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Guided</h4>
              <p className="text-sm text-muted-foreground">
                Benefits from step-by-step AI assistance
              </p>
            </div>
          </div>

          <div className="mt-6 bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Behavior Tracking</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Learning style is inferred from your behavior patterns:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Time spent on theory vs practice</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>AI usage frequency</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Quiz attempt rate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Challenge attempt rate</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Adaptive AI Tutor */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/15">
              <Brain className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Adaptive AI Tutor</h2>
              <p className="text-muted-foreground">Personalized tutoring based on your profile</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Context Awareness</h3>
              <p className="text-muted-foreground mb-4">
                The AI tutor knows your complete learning profile to provide personalized guidance.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Current theta and ability level</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Topic mastery map</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Weak and strong topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Learning velocity classification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Learning style profile</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Adaptive Behavior</h3>
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-sm">Beginner/Struggling</p>
                  <p className="text-xs text-muted-foreground">
                    Detailed explanations, step-by-step guidance, extra examples
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-sm">Intermediate/Stable</p>
                  <p className="text-xs text-muted-foreground">
                    Balanced explanations, targeted hints, moderate challenge
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-sm">Advanced/Expert</p>
                  <p className="text-xs text-muted-foreground">
                    Concise explanations, challenge-oriented coaching, minimal guidance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Summary */}
        <GlassCard className="p-8 border-primary/30">
          <h2 className="text-2xl font-bold mb-4">Summary</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">IRT Model</p>
                <p className="text-sm text-muted-foreground">
                  Psychometric ability estimation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Topic Mastery</p>
                <p className="text-sm text-muted-foreground">
                  Per-concept tracking with decay
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <p className="font-medium">Spaced Repetition</p>
                <p className="text-sm text-muted-foreground">
                  Enhanced SM-2 with predictions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <p className="font-medium">Learning Velocity</p>
                <p className="text-sm text-muted-foreground">
                  Improvement speed tracking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Network className="w-5 h-5 text-pink-500 mt-1" />
              <div>
                <p className="font-medium">Knowledge Graph</p>
                <p className="text-sm text-muted-foreground">
                  Concept relationships
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-500 mt-1" />
              <div>
                <p className="font-medium">Learning Style</p>
                <p className="text-sm text-muted-foreground">
                  Behavior-based adaptation
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </Layout>
  );
}
