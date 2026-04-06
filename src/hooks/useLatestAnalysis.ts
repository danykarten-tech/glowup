import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface AnalysisResult {
  id: string;
  overall_score: number;
  symmetry_score: number | null;
  skin_score: number | null;
  hairstyle_score: number | null;
  style_score: number | null;
  photo_url: string | null;
  share_token: string | null;
  created_at: string;
  analysis_data: {
    personalized_insights?: string[];
    category_breakdown?: {
      skin_quality?: { score: number; explanation: string; suggestion: string };
      symmetry?: { score: number; explanation: string; suggestion: string };
      glow_level?: { score: number; explanation: string; suggestion: string };
      acne_risk?: { score: number; explanation: string; suggestion: string };
    };
    glow_potential?: {
      improvement_percent: number;
      message: string;
    };
    ai_confidence?: {
      level: "high" | "moderate" | "low";
      reason: string;
    };
    symmetry?: {
      description?: string;
      details: { label: string; value: number }[];
      tips?: string[];
    };
    skin?: {
      description?: string;
      details: { label: string; value: number }[];
      tips: string[];
      product_suggestions?: { name: string; reason: string; category: string }[];
    };
    hairstyle?: {
      description?: string;
      face_shape?: string;
      suggestions: { name: string; match: number; description: string }[];
      product_suggestions?: { name: string; reason: string; category: string }[];
    };
    style?: {
      description?: string;
      recommendations: { category: string; tip: string; priority: string }[];
      product_suggestions?: { name: string; reason: string; category: string }[];
    };
    summary?: string;
  } | null;
}

export function useLatestAnalysis() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAnalysis(data as unknown as AnalysisResult);
        setLoading(false);
      });
  }, [user]);

  return { analysis, loading };
}

export function useAnalysisById(id: string | null) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return;
    }
    supabase
      .from("analysis_history")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setAnalysis(data as unknown as AnalysisResult);
        setLoading(false);
      });
  }, [user, id]);

  return { analysis, loading };
}
