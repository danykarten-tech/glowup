import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Cpu, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Upload Your Selfie",
    desc: "Take a front-facing photo with good lighting. No filters needed — our AI works best with natural photos.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analyzes Your Features",
    desc: "Our AI processes 68+ facial landmarks, analyzes skin texture, evaluates symmetry, and assesses your current style in seconds.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get Your Glow-Up Plan",
    desc: "Receive a detailed score breakdown with personalized recommendations for hairstyle, skincare, and style improvements.",
  },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            How <span className="gradient-text">FaceNova</span> Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Three simple steps to discover your glow-up potential.
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center shrink-0 glow-shadow">
                <s.icon className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold text-primary mb-1">Step {s.step}</p>
                <h3 className="font-display text-2xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" className="gradient-bg border-0 text-primary-foreground px-8 h-12 gap-2" asChild>
            <Link to="/signup">
              Try It Now — Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default HowItWorks;
