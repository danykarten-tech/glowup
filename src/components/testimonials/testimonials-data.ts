export type Testimonial = {
  name: string;
  age: string;
  avatar: string;
  rating: number;
  text: string;
  improvement: string;
  tag: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Sophie M.",
    age: "23",
    avatar: "S",
    rating: 5,
    text: "I was skeptical at first, but the AI analysis was spot on! My skin score improved by 15% in just 3 weeks following the recommendations.",
    improvement: "+15%",
    tag: "Skin Care",
  },
  {
    name: "Emma L.",
    age: "28",
    avatar: "E",
    rating: 5,
    text: "The hairstyle recommendations completely changed my look. I've never received so many compliments. This app is a game changer!",
    improvement: "+22%",
    tag: "Hairstyle",
  },
  {
    name: "Olivia R.",
    age: "21",
    avatar: "O",
    rating: 5,
    text: "Love tracking my glow-up progress over time. The symmetry analysis helped me understand my face structure better than any consultation.",
    improvement: "+18%",
    tag: "Symmetry",
  },
  {
    name: "Mia K.",
    age: "26",
    avatar: "M",
    rating: 5,
    text: "Finally an app that gives real, actionable beauty tips. My confidence has skyrocketed since I started using FaceNova every week.",
    improvement: "+20%",
    tag: "Confidence",
  },
  {
    name: "Ava T.",
    age: "24",
    avatar: "A",
    rating: 5,
    text: "The product recommendations matched my skin type perfectly. I've saved so much money by not buying the wrong skincare products anymore.",
    improvement: "+25%",
    tag: "Products",
  },
  {
    name: "Isabella N.",
    age: "30",
    avatar: "I",
    rating: 5,
    text: "I use this before every important event. The style improvement tips are incredibly detailed and personalized. Worth every penny!",
    improvement: "+17%",
    tag: "Style",
  },
  {
    name: "Charlotte W.",
    age: "22",
    avatar: "C",
    rating: 5,
    text: "The AI detected things about my skin I never noticed. After following the routine it suggested, my friends keep asking what I changed!",
    improvement: "+19%",
    tag: "Skin Care",
  },
];