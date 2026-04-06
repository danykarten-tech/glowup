import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import TestimonialCard from "@/components/testimonials/TestimonialCard";
import { testimonials } from "@/components/testimonials/testimonials-data";

const AUTO_SCROLL_SPEED = 0.35;
const MANUAL_SCROLL_BOOST = 40;

const Testimonials = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const firstSet = firstSetRef.current;
    if (!firstSet) return;

    const updateWidth = () => {
      setSetWidth(firstSet.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(firstSet);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !setWidth) return;

    let animationFrame = 0;

    const animate = () => {
      const autoStep = !isPaused && !prefersReducedMotionRef.current ? AUTO_SCROLL_SPEED : 0;
      let nextOffset = offsetRef.current + autoStep + velocityRef.current;

      velocityRef.current *= 0.9;
      if (Math.abs(velocityRef.current) < 0.05) {
        velocityRef.current = 0;
      }

      if (nextOffset >= setWidth) {
        nextOffset -= setWidth;
      } else if (nextOffset < 0) {
        nextOffset += setWidth;
      }

      offsetRef.current = nextOffset;
      track.style.transform = `translate3d(${-nextOffset}px, 0, 0)`;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, setWidth]);

  const handleArrowClick = (direction: number) => {
    velocityRef.current += direction * MANUAL_SCROLL_BOOST;
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-14 px-4 sm:px-6 bg-muted/10" aria-label="Testimonials">
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-56 w-[42rem] -translate-x-1/2 blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 72%)" }}
      />

      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            <Star className="w-3 h-3" />
            Real Results
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2.5">
            Loved by Thousands
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            See what our users are saying about their glow-up journey
          </p>
        </motion.div>

        <div className="mb-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleArrowClick(-1)}
            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
            aria-label="Previous testimonials"
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.16), hsl(var(--accent) / 0.14))" }}
            />
            <ChevronLeft className="relative h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </button>
          <button
            type="button"
            onClick={() => handleArrowClick(1)}
            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
            aria-label="Next testimonials"
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.16), hsl(var(--accent) / 0.14))" }}
            />
            <ChevronRight className="relative h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent" />

          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div ref={trackRef} className="flex w-max will-change-transform">
              <div ref={firstSetRef} className="flex gap-5 pr-5">
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={`${testimonial.name}-primary`} testimonial={testimonial} />
                ))}
              </div>

              <div className="flex gap-5 pr-5" aria-hidden="true">
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={`${testimonial.name}-duplicate`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
