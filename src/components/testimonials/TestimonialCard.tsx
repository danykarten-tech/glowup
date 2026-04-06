import { motion } from "framer-motion";
import { Star } from "lucide-react";

import type { Testimonial } from "./testimonials-data";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="group relative flex h-full min-h-[240px] sm:min-h-[280px] w-[260px] sm:w-[320px] md:w-[330px] flex-shrink-0 flex-col rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-md shadow-primary/5 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Rating */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} className="h-3.5 w-3.5 fill-primary text-primary" />
        ))}
      </div>

      {/* Tags */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {testimonial.tag}
        </span>
        <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {testimonial.improvement} Glow Score
        </span>
      </div>

      {/* Quote */}
      <p className="flex-1 text-[15px] leading-7 text-muted-foreground">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-bg text-sm font-bold text-primary-foreground shadow-md shadow-primary/15">
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.age} years old</p>
        </div>
      </div>
    </motion.article>
  );
};

export default TestimonialCard;
