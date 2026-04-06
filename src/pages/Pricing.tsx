import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Crown, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for trying FaceNova",
    icon: Zap,
    features: [
      "2 analyses per day",
      "20 analyses per month",
      "Glow-up score",
      "Face symmetry analysis",
      "Skin quality analysis",
      "Basic recommendations",
    ],
    cta: "Get Started Free",
    featured: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    desc: "For regular glow-up tracking",
    icon: Crown,
    features: [
      "5 analyses per day",
      "100 analyses per month",
      "All analysis categories",
      "Hairstyle & style AI",
      "Shareable result cards",
      "Download HD reports",
      "Progress tracking & history",
    ],
    cta: "Upgrade to Pro",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Ultimate",
    price: "₹199",
    period: "/month",
    desc: "For serious glow-up enthusiasts",
    icon: Sparkles,
    features: [
      "Unlimited daily analyses",
      "Unlimited monthly analyses",
      "Everything in Pro",
      "Priority AI processing",
      "Product recommendations",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Go Ultimate",
    featured: false,
    badge: "Best Value",
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-2xl p-[1px] ${plan.featured ? "gradient-bg glow-shadow" : "bg-border"}`}
            >
              <div className="bg-card rounded-2xl p-7 h-full flex flex-col">
                {plan.badge && (
                  <span
                    className={`self-start text-xs font-semibold px-3 py-1 rounded-full mb-4 ${
                      plan.featured
                        ? "gradient-bg text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mt-1 mb-1">
                  <span className="text-4xl font-display font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    plan.featured
                      ? "gradient-bg border-0 text-primary-foreground w-full"
                      : "w-full"
                  }
                  variant={plan.featured ? "default" : "outline"}
                  asChild
                >
                  <Link to="/signup">{plan.cta}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Pricing;
