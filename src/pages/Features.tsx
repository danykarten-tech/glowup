import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Scan, Droplets, Scissors, Shirt, Sparkles, Camera } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Face Symmetry Analysis",
    desc: "Our AI detects 68+ facial landmarks to measure precise symmetry ratios. Get detailed breakdowns of eye alignment, jawline balance, and overall facial harmony.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Droplets,
    title: "Skin Quality Assessment",
    desc: "Advanced texture analysis evaluates clarity, hydration, tone evenness, and overall skin health. Receive personalized skincare tips based on your results.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Scissors,
    title: "Hairstyle Recommendations",
    desc: "AI determines your face shape and recommends hairstyles with the highest compatibility scores. See how different styles could transform your look.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Shirt,
    title: "Style Improvement Tips",
    desc: "Get personalized fashion and grooming recommendations. From color palettes that complement your features to accessories that elevate your aesthetic.",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Glow-Up Score",
    desc: "A comprehensive 0–100 score combining all analysis categories. Track your progress over time and see how small changes lead to big improvements.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Camera,
    title: "Shareable Results",
    desc: "Download beautiful result cards and share them on social media. Compare scores with friends and inspire each other's glow-up journey.",
    color: "from-teal-500 to-emerald-500",
  },
];

const Features = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Powerful <span className="gradient-text">AI Features</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced facial analysis technology meets beautiful, actionable insights.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl gradient-bg-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Features;
