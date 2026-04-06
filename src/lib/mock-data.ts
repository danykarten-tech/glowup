export const mockAnalysisResult = {
  overallScore: 82,
  categories: {
    symmetry: {
      score: 85,
      label: "Face Symmetry",
      description: "Your facial symmetry is above average with well-balanced proportions.",
      details: [
        { label: "Eye Alignment", value: 88 },
        { label: "Nose Centering", value: 82 },
        { label: "Jawline Balance", value: 84 },
        { label: "Lip Symmetry", value: 86 },
      ],
    },
    skin: {
      score: 78,
      label: "Skin Quality",
      description: "Your skin shows good overall health with minor areas for improvement.",
      details: [
        { label: "Texture", value: 80 },
        { label: "Clarity", value: 75 },
        { label: "Tone Evenness", value: 76 },
        { label: "Hydration", value: 82 },
      ],
      tips: [
        "Use SPF 30+ sunscreen daily to protect skin tone",
        "Add a vitamin C serum to your morning routine",
        "Incorporate retinol for improved texture",
        "Stay hydrated — aim for 8 glasses of water daily",
      ],
    },
    hairstyle: {
      score: 80,
      label: "Hairstyle Match",
      faceShape: "Oval",
      description: "Your oval face shape works well with most hairstyles.",
      suggestions: [
        {
          name: "Textured Fringe",
          match: 92,
          description: "A textured fringe adds dimension and frames your face beautifully.",
        },
        {
          name: "Side Part Waves",
          match: 88,
          description: "Soft waves with a side part complement your face shape perfectly.",
        },
        {
          name: "Slicked Back",
          match: 85,
          description: "A clean slicked-back style highlights your balanced features.",
        },
        {
          name: "Layered Bob",
          match: 83,
          description: "Layers around the face add softness and movement.",
        },
      ],
    },
    style: {
      score: 84,
      label: "Style Rating",
      description: "Your overall style has great potential with some key improvements.",
      recommendations: [
        {
          category: "Colors",
          tip: "Earth tones and jewel tones complement your skin tone best.",
          priority: "high",
        },
        {
          category: "Grooming",
          tip: "Define your brow shape for a more polished look.",
          priority: "high",
        },
        {
          category: "Accessories",
          tip: "Minimalist gold jewelry would elevate your overall aesthetic.",
          priority: "medium",
        },
        {
          category: "Wardrobe",
          tip: "Invest in well-fitted basics — they make every outfit look premium.",
          priority: "medium",
        },
        {
          category: "Skincare",
          tip: "A consistent PM routine will dramatically improve your glow.",
          priority: "low",
        },
      ],
    },
  },
};

export const mockHistory = [
  { id: "1", date: "2026-03-30", score: 82, thumbnail: "📸" },
  { id: "2", date: "2026-03-25", score: 78, thumbnail: "📸" },
  { id: "3", date: "2026-03-18", score: 75, thumbnail: "📸" },
  { id: "4", date: "2026-03-10", score: 71, thumbnail: "📸" },
  { id: "5", date: "2026-03-01", score: 68, thumbnail: "📸" },
];

export const mockUser = {
  name: "Alex Rivera",
  email: "alex@example.com",
  plan: "Premium" as const,
  analysesUsed: 12,
  analysesLimit: null,
  memberSince: "Jan 2026",
  avatar: null,
};

export const faqItems = [
  {
    question: "How does FaceNova analyze my face?",
    answer: "Our AI uses advanced facial landmark detection to analyze over 68 key points on your face. It evaluates symmetry, skin quality, facial proportions, and more to generate your personalized glow-up score.",
  },
  {
    question: "Is my photo stored or shared?",
    answer: "Your privacy is our priority. Photos are processed in real-time and are never shared with third parties. Premium users can optionally save their history for progress tracking.",
  },
  {
    question: "How accurate is the analysis?",
    answer: "Our AI has been trained on millions of data points and achieves 94% correlation with professional beauty assessments. However, beauty is subjective and scores are meant as fun, motivational guidance.",
  },
  {
    question: "Can I use FaceNova for free?",
    answer: "Yes! The free plan includes 2 analyses per day and 20 per month. Upgrade to Pro (₹99/mo) for 5 daily and 100 monthly analyses with shareable result cards and progress tracking, or go Ultimate (₹199/mo) for unlimited analyses, priority AI processing, and product recommendations.",
  },
  {
    question: "What makes a good selfie for analysis?",
    answer: "For best results, use a well-lit front-facing photo with no filters. Natural lighting works best. Make sure your full face is visible and centered in the frame.",
  },
  {
    question: "How often should I re-analyze?",
    answer: "We recommend re-analyzing every 2-4 weeks to track your glow-up progress. This gives enough time for skincare and style changes to show visible results.",
  },
];

export const loadingMessages = [
  "Detecting facial landmarks...",
  "Analyzing face symmetry...",
  "Evaluating skin quality...",
  "Matching hairstyle options...",
  "Generating style recommendations...",
  "Calculating your glow-up score...",
  "Preparing your results...",
];
