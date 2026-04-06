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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32 pb-0 overflow-hidden" aria-label="Hero">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
            style={{ background: `radial-gradient(ellipse, hsl(var(--glow-purple)), hsl(var(--glow-pink)), transparent)` }}
          />

          <div className="container mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            {/* Desktop & Tablet: side-by-side | Mobile: image-first stacked */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-6 items-start">
              {/* Left - Content (on mobile, order-2 so image shows first) */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="z-10 pb-6 md:pb-16 md:pr-4 lg:pr-8 order-2 md:order-1"
              >
                <div className="flex flex-col items-start gap-3 mb-6 max-w-[520px]">
                  <h1 className="font-display text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.1] tracking-[-0.02em]" style={{ fontWeight: 800 }}>
                    <span className="block text-foreground">Discover Your</span>
                    <span className="block gradient-text whitespace-nowrap">True Glow</span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium tracking-tight">AI Face Analysis in Seconds</p>
                </div>

                 <p className="text-base md:text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                   Upload a selfie to instantly analyze facial symmetry, skin quality, glow level, and personalized beauty tips to improve your look.
                 </p>

                 <div className="flex flex-col gap-2.5 mb-8">
                   {["Instant AI face & glow analysis", "Personalized skin and style recommendations", "Track your glow progress over time"].map((item) => (
                     <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                       <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                       <span>{item}</span>
                     </div>
                   ))}
                 </div>

                 <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-12">
                   <Button size="lg" className="w-full sm:w-auto gradient-bg border-0 text-primary-foreground text-base px-8 h-14 gap-2.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow" asChild>
                     <Link to="/signup">
                       Start Free Glow Scan
                       <Camera className="w-4 h-4" aria-hidden="true" />
                     </Link>
                   </Button>
                   <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 gap-2 border-border/60 hover:bg-accent/10 hover:border-primary/40 text-foreground hover:text-[#111] transition-all duration-200" asChild>
                     <Link to="/how-it-works">
                       How It Works
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                {/* Social proof mini card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-card border border-border/60 rounded-2xl p-5 max-w-xs shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Skin Improvement</span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ChevronUp className="w-3 h-3" /> 98.7%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-md shadow-primary/20">
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
                  <p className="text-3xl font-display font-bold gradient-text tracking-tight">98.7%</p>
                </motion.div>
              </motion.div>

              {/* Right - Image with Scan (on mobile, order-1 so it appears first) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative flex items-end justify-center md:justify-end order-1 md:order-2"
              >
                <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
                  {/* Background glow */}
                  <div className="absolute -inset-6 rounded-3xl opacity-[0.08] blur-[60px] pointer-events-none"
                    style={{ background: `linear-gradient(135deg, hsl(var(--glow-purple)), hsl(var(--glow-pink)))` }}
                  />

                  {/* Image container with CSS mask for seamless bottom fade */}
                  <div
                    className="relative rounded-2xl md:rounded-t-[1.5rem] md:rounded-b-none overflow-hidden shadow-2xl shadow-foreground/5"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                      maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
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

                    {/* Scan overlay */}
                    <HeroScanAnimation />
                  </div>

                  {/* Floating AI Scanning badge - bottom left - hidden on mobile to keep face clear */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    whileHover={{ scale: 1.05, rotateY: 0 }}
                    className="hidden md:flex absolute bottom-16 md:bottom-14 lg:bottom-32 left-2 md:left-3 lg:left-4 rounded-xl md:rounded-2xl px-3 md:px-4 lg:px-5 py-2.5 md:py-3 lg:py-3.5 items-center gap-2 md:gap-3 cursor-default animate-[float_3.5s_ease-in-out_infinite_0.3s]"
                    style={{
                      background: 'linear-gradient(145deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.8))',
                      backdropFilter: 'blur(24px) saturate(200%)',
                      border: '1px solid hsl(var(--primary) / 0.25)',
                      boxShadow: '0 12px 40px hsl(var(--primary) / 0.15), 0 4px 12px hsl(0 0% 0% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.35), inset 0 -1px 0 hsl(0 0% 0% / 0.05)',
                      transform: 'perspective(800px) rotateY(-2deg)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.12), transparent)' }} />
                    </div>
                    <div className="w-7 md:w-8 lg:w-9 h-7 md:h-8 lg:h-9 rounded-full gradient-bg flex items-center justify-center shadow-md shadow-primary/25 relative">
                      <Sparkles className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-primary-foreground" />
                      <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.2), transparent 50%)' }} />
                    </div>
                    <div className="relative">
                      <p className="text-xs md:text-sm font-semibold text-foreground">AI Scanning</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">98.7% Improved</p>
                    </div>
                  </motion.div>

                  {/* AI Badge - top left - smaller on mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    whileHover={{ scale: 1.08 }}
                    className="absolute top-[82%] md:top-3 lg:top-6 left-2 lg:left-4 inline-flex items-center gap-1.5 lg:gap-2.5 px-3 lg:px-6 py-2 lg:py-3 rounded-full text-[10px] lg:text-xs font-semibold text-primary cursor-default animate-[float_3s_ease-in-out_infinite]"
                    style={{
                      background: 'linear-gradient(145deg, hsl(var(--card) / 0.97), hsl(var(--card) / 0.82))',
                      backdropFilter: 'blur(24px) saturate(200%)',
                      border: '1px solid hsl(var(--primary) / 0.3)',
                      boxShadow: '0 12px 40px hsl(var(--primary) / 0.18), 0 4px 12px hsl(0 0% 0% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.4), inset 0 -1px 0 hsl(0 0% 0% / 0.05)',
                      transform: 'perspective(800px) rotateY(2deg)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-1/2" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.15), transparent)' }} />
                    </div>
                    <Star className="w-3 lg:w-3.5 h-3 lg:h-3.5 relative" aria-hidden="true" />
                    <span className="relative">AI-Powered</span>
                  </motion.div>

                  {/* Floating score badge - top right - compact on mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    whileHover={{ scale: 1.05, rotateY: 0, rotateX: 0 }}
                    className="absolute top-3 lg:top-6 right-2 lg:right-4 rounded-xl lg:rounded-2xl px-3 lg:px-6 py-2.5 lg:py-5 text-center cursor-default animate-[float_4s_ease-in-out_infinite_0.5s]"
                    style={{
                      background: 'linear-gradient(145deg, hsl(var(--card) / 0.97), hsl(var(--card) / 0.82))',
                      backdropFilter: 'blur(24px) saturate(200%)',
                      border: '1px solid hsl(var(--primary) / 0.25)',
                      boxShadow: '0 16px 48px hsl(var(--primary) / 0.2), 0 6px 16px hsl(0 0% 0% / 0.12), inset 0 2px 0 hsl(0 0% 100% / 0.35), inset 0 -1px 0 hsl(0 0% 0% / 0.05)',
                      transform: 'perspective(800px) rotateY(-3deg) rotateX(2deg)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl lg:rounded-2xl overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl lg:rounded-t-2xl" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.12), transparent)' }} />
                    </div>
                    <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1 lg:mb-2 relative">Glow Score</p>
                    <p className="text-3xl lg:text-5xl font-display font-extrabold gradient-text leading-none drop-shadow-sm relative">82</p>
                    <div className="w-full h-[1px] my-1.5 lg:my-2.5 relative" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)' }} />
                    <div className="flex items-center justify-center gap-1 lg:gap-1.5 relative">
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
        <section className="py-10 md:py-14 border-y border-border/50 bg-muted/20" aria-label="Statistics">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <AnimatedCounter value={stat.value} className="text-3xl md:text-4xl font-display font-bold gradient-text" />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 md:py-16 px-4 sm:px-6" aria-label="Features">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2.5">
                AI-Powered Beauty Insights
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
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
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-[1px] rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(145deg, hsl(var(--border) / 0.5), hsl(var(--primary) / 0.15), hsl(var(--border) / 0.5))' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.3), hsl(var(--primary) / 0.4))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, hsl(var(--border) / 0.5), hsl(var(--primary) / 0.15), hsl(var(--border) / 0.5))';
                  }}
                >
                  <div className="relative h-full p-6 rounded-[calc(1rem-1px)] bg-card/90" style={{ backdropFilter: 'blur(16px) saturate(180%)' }}>
                    <div className="absolute inset-0 rounded-[calc(1rem-1px)] overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-1/3" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.06), transparent)' }} />
                    </div>
                    <div className="relative w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                      <f.icon className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                      <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.2), transparent 50%)' }} />
                    </div>
                    <h3 className="relative font-display font-semibold text-lg mb-1.5">{f.title}</h3>
                    <p className="relative text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA */}
        <section className="py-12 md:py-14 px-4 sm:px-6" aria-label="Call to action">
          <div className="container mx-auto max-w-4xl text-center">
            <div
              className="relative overflow-hidden rounded-[2rem] border-2 border-border bg-background"
            >
              <div className="relative px-6 py-10 md:px-12 md:py-12">
                <div className="relative inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start Your AI Glow-Up
                </div>

                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] gradient-bg shadow-lg shadow-primary/25">
                  <div
                    className="absolute inset-0 rounded-[1.35rem]"
                    style={{ background: "linear-gradient(180deg, hsl(0 0% 100% / 0.22), transparent 58%)" }}
                  />
                  <Sparkles className="relative h-6 w-6 text-primary-foreground" />
                </div>

                <h2 className="relative font-display text-3xl md:text-4xl font-bold mb-2.5">Ready to Discover Your Glow?</h2>
                <p className="relative text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
                  Join thousands who've already discovered their glow-up potential with AI-powered beauty analysis.
                </p>

                <div className="relative mb-7 flex flex-wrap items-center justify-center gap-2.5">
                  {[
                    "2 free scans daily",
                    "Private beauty analysis",
                    "Instant personalized insights",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="relative w-full sm:w-auto gradient-bg border-0 text-primary-foreground text-base px-10 h-12 gap-2.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  asChild
                >
                  <Link to="/signup">
                    Start Free Analysis
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </Button>

                <p className="relative mt-4 text-xs text-muted-foreground">No card required to try your first analysis.</p>
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
