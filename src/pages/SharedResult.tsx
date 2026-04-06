import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import FaceNovaLogo from "@/components/FaceNovaLogo";
import { motion } from "framer-motion";

interface SharedData {
  overall_score: number;
  symmetry_score: number | null;
  skin_score: number | null;
  hairstyle_score: number | null;
  style_score: number | null;
  created_at: string;
}

const SharedResult = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc("get_shared_analysis", { p_share_token: token })
      .then(({ data: rows, error: err }) => {
        if (err || !rows || (rows as any[]).length === 0) {
          setError(true);
        } else {
          setData((rows as any[])[0]);
        }
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Result Not Found</h1>
          <p className="text-muted-foreground">This shared result link may have expired or is invalid.</p>
          <Button className="gradient-bg border-0 text-primary-foreground" asChild>
            <Link to="/">Try FaceNova</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categories = [
    { label: "Symmetry", score: data.symmetry_score },
    { label: "Skin", score: data.skin_score },
    { label: "Hairstyle", score: data.hairstyle_score },
    { label: "Style", score: data.style_score },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl mb-4">
          <FaceNovaLogo size={40} />
          FaceNova
        </Link>
        <h1 className="font-display text-3xl font-bold mt-4 mb-2">FaceNova Score</h1>
        <p className="text-muted-foreground">
          Analyzed on {new Date(data.created_at).toLocaleDateString()}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <div className="w-80 rounded-2xl overflow-hidden gradient-bg p-[1px]">
          <div className="bg-card rounded-2xl p-6 flex flex-col items-center gap-4">
            <GlowScoreGauge score={data.overall_score} size={160} label="Overall Score" />
            <div className="w-full grid grid-cols-2 gap-3 text-center text-sm">
              {categories.map((cat) => (
                <div key={cat.label} className="bg-muted rounded-lg p-2">
                  <p className="font-semibold text-foreground">{cat.score ?? "—"}%</p>
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
        <Button className="gradient-bg border-0 text-primary-foreground gap-2 px-8" asChild>
          <Link to="/signup">
            <Sparkles className="w-4 h-4" />
            Get Your Own Score
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default SharedResult;
