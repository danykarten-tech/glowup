import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, TrendingUp, Star, ArrowRight, Camera, ChevronUp, CheckCircle2 } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import Footer from "@/components/Footer";
import HeroScanAnimation from "@/components/HeroScanAnimation";
import Testimonials from "@/components/Testimonials";
import heroModel from "@/assets/hero-model.jpg";

const stats = [
  { value: "2M+", label: "Analyses Done" },
  { value: "94%", label: "Accuracy Rate" },
  { value: "150K+", label: "Happy Users" },
];

const features = [
  { icon: Sparkles, title: "AI Face Analysis", desc: "Advanced facial landmark detection for precise scoring" },
  { icon: Shield, title: "Privacy First", desc: "Photos processed in real-time, never stored" },
  { icon: Zap, title: "Instant Results", desc: "Get your glow-up score in under 30 seconds" },
  { icon: TrendingUp, title: "Track Progress", desc: "Compare results over time and see improvement" },
];

const Landing = () => {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--glow-purple)), transparent 70%)' }}
        />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[120px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--glow-pink)), transparent 70%)' }}
        />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32 pb-0 overflow-hidden" aria-label="Hero">
          {/* Hero glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-[0.06] blur-[150px] pointer-events-none"
            style={{ background: `radial-gradient(ellipse, hsl(var(--glow-purple)), hsl(var(--glow-pink)), transparent)` }}
          />

          {/* Floating particles */}
          <div className="absolute top-32 left-[10%] w-1.5 h-1.5 rounded-full bg-primary/30 floating" />
          <div className="absolute top-48 right-[15%] w-1 h-1 rounded-full bg-accent/30 floating-delayed" />
          <div className="absolute top-64 left-[20%] w-2 h-2 rounded-full bg-glow-violet/20 floating-slow" />

          <div className="container mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-6 items-start">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="z-10 pb-6 md:pb-16 md:pr-4 lg:pr-8 order-2 md:order-1"
              >
                <div className="flex flex-col items-start gap-3 mb-6 max-w-[520px]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur-sm"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI-Powered Beauty
                  </motion.div>
                  
                  <h1 className="font-display text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.05] tracking-[-0.03em]" style={{ fontWeight: 900 }}>
                    <span className="block text-foreground">Discover Your</span>
                    <span className="block gradient-text whitespace-nowrap">True Glow</span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium tracking-tight">AI Face Analysis in Seconds</p>
                </div>

                <p className="text-base md:text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                  Upload a selfie to instantly analyze facial symmetry, skin quality, glow level, and personalized beauty tips to improve your look.
                </p>

                <div className="flex flex-col gap-2.5 mb-8">
                  {["Instant AI face & glow analysis", "Personalized skin and style recommendations", "Track your glow progress over time"].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-12">
                  <Button size="lg" className="w-full sm:w-auto gradient-bg border-0 text-primary-foreground text-base px-8 h-14 gap-2.5 btn-glow" asChild>
                    <Link to="/signup">
                      Start Free Glow Scan
                      <Camera className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 gap-2" asChild>
                    <Link to="/how-it-works">
                      How It Works
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                {/* Social proof card - glass style */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="glass-card rounded-2xl p-5 max-w-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Skin Improvement</span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                      <ChevronUp className="w-3 h-3" /> 98.7%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-primary/25 animate-glow-pulse">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Charlotte</p>
                      <p className="text-xs text-muted-foreground">19Y · Female</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <ChevronUp className="w-3 h-3 text-primary" />
                    18% improvement from last week
                  </div>
                  <p className="text-3xl font-display font-black gradient-text tracking-tight">98.7%</p>
                </motion.div>
              </motion.div>

              {/* Right - Image with Scan */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-end justify-center md:justify-end order-1 md:order-2"
              >
                <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
                  {/* Neon glow behind image */}
                  <div className="absolute -inset-8 rounded-3xl opacity-[0.12] blur-[80px] pointer-events-none animate-pulse-glow"
                    style={{ background: `linear-gradient(135deg, hsl(var(--glow-purple)), hsl(var(--glow-pink)))` }}
                  />

                  <div
                    className="relative rounded-2xl md:rounded-t-[1.5rem] md:rounded-b-none overflow-hidden"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                      maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                      boxShadow: '0 25px 50px -12px hsl(var(--glow-purple) / 0.15)',
                    }}
                  >
                    <img
                      src={heroModel}
                      alt="AI face scan analysis demonstration"
                      className="w-full object-cover h-[40vh] md:h-auto"
                      width={896}
                      height={1120}
                      fetchPriority="high"
                    />
                    <HeroScanAnimation />
                  </div>

                  {/* Floating AI badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="hidden md:flex absolute bottom-16 md:bottom-14 lg:bottom-32 left-2 md:left-3 lg:left-4 glass-card rounded-xl md:rounded-2xl px-3 md:px-4 lg:px-5 py-2.5 md:py-3 lg:py-3.5 items-center gap-2 md:gap-3 cursor-default floating"
                  >
                    <div className="w-7 md:w-8 lg:w-9 h-7 md:h-8 lg:h-9 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-primary/25">
                      <Sparkles className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-foreground">AI Scanning</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">98.7% Improved</p>
                    </div>
                  </motion.div>

                  {/* AI-Powered badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    whileHover={{ scale: 1.08 }}
                    className="absolute top-[82%] md:top-3 lg:top-6 left-2 lg:left-4 inline-flex items-center gap-1.5 lg:gap-2.5 glass-card px-3 lg:px-6 py-2 lg:py-3 rounded-full text-[10px] lg:text-xs font-semibold text-primary cursor-default floating-delayed"
                  >
                    <Star className="w-3 lg:w-3.5 h-3 lg:h-3.5" aria-hidden="true" />
                    <span>AI-Powered</span>
                  </motion.div>

                  {/* Score badge */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute top-3 lg:top-6 right-2 lg:right-4 glass-card rounded-xl lg:rounded-2xl px-3 lg:px-6 py-2.5 lg:py-5 text-center cursor-default floating-slow"
                  >
                    <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1 lg:mb-2">Glow Score</p>
                    <p className="text-3xl lg:text-5xl font-display font-black gradient-text leading-none drop-shadow-sm">82</p>
                    <div className="w-full h-px my-1.5 lg:my-2.5 gradient-bg opacity-30" />
                    <div className="flex items-center justify-center gap-1 lg:gap-1.5">
                      <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
                      <span className="text-[10px] lg:text-[11px] text-primary font-semibold tracking-wide">Excellent</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 md:py-14 border-y border-border/20 relative" aria-label="Statistics">
          <div className="absolute inset-0 bg-secondary/20" />
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <AnimatedCounter value={stat.value} className="text-3xl md:text-4xl font-display font-black gradient-text" />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 md:py-20 px-4 sm:px-6 relative" aria-label="Features">
          {/* Background orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(var(--glow-violet)), transparent)' }}
          />

          <div className="container mx-auto max-w-4xl relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-4"
              >
                <Zap className="h-3 w-3" />
                Features
              </motion.div>
              <h2 className="font-display text-3xl md:text-5xl font-black mb-3">
                AI-Powered Beauty <span className="gradient-text">Insights</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
                Advanced technology meets beauty science for personalized results
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.article
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group glass-card-hover rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/20 group-hover:shadow-primary/40">
                    <f.icon className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA */}
        <section className="py-12 md:py-16 px-4 sm:px-6 relative" aria-label="Call to action">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="relative overflow-hidden rounded-[2rem] glass-card border-primary/10">
              {/* CTA ambient glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1/2 h-1/2 opacity-[0.08] blur-[80px]"
                  style={{ background: 'radial-gradient(circle, hsl(var(--glow-purple)), transparent)' }}
                />
                <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 opacity-[0.06] blur-[60px]"
                  style={{ background: 'radial-gradient(circle, hsl(var(--glow-pink)), transparent)' }}
                />
              </div>

              <div className="relative px-6 py-10 md:px-12 md:py-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start Your AI Glow-Up
                </div>

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-primary/30 animate-glow-pulse">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>

                <h2 className="font-display text-3xl md:text-4xl font-black mb-3">Ready to Discover Your <span className="gradient-text">Glow</span>?</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed text-base md:text-lg">
                  Join thousands who've already discovered their glow-up potential with AI-powered beauty analysis.
                </p>

                <div className="mb-7 flex flex-wrap items-center justify-center gap-2.5">
                  {["2 free scans daily", "Private beauty analysis", "Instant personalized insights"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border/50 bg-secondary/40 backdrop-blur-sm px-3.5 py-1.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full sm:w-auto gradient-bg border-0 text-primary-foreground text-base px-10 h-13 gap-2.5 btn-glow"
                  asChild
                >
                  <Link to="/signup">
                    Start Free Analysis
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </Button>

                <p className="mt-4 text-xs text-muted-foreground/60">No card required to try your first analysis.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
