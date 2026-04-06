import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { photo_url, storage_path } = await req.json();
    if (!photo_url) {
      return new Response(
        JSON.stringify({ error: "photo_url is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Server-side plan limit enforcement
    const adminClient = createClient(supabaseUrl, serviceKey);
    const PLAN_LIMITS: Record<string, { daily: number; monthly: number }> = {
      free: { daily: 2, monthly: 20 },
      pro: { daily: 5, monthly: 100 },
      ultimate: { daily: Infinity, monthly: Infinity },
    };

    const { data: profile } = await adminClient
      .from("profiles")
      .select("plan, bonus_credits")
      .eq("id", user.id)
      .maybeSingle();

    const { data: isAdmin } = await adminClient.rpc("is_admin_email", { user_id: user.id });

    const userPlan = isAdmin ? "ultimate" : (profile?.plan || "free");
    const limits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS.free;
    const bonusCredits = (profile as any)?.bonus_credits || 0;

    if (limits.monthly !== Infinity) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [monthRes, dayRes] = await Promise.all([
        adminClient
          .from("analysis_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString()),
        adminClient
          .from("analysis_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString()),
      ]);

      const monthCount = monthRes.count || 0;
      const dayCount = dayRes.count || 0;
      const effectiveMonthly = limits.monthly + bonusCredits;

      if (dayCount >= limits.daily) {
        return new Response(
          JSON.stringify({
            error: "limit_reached",
            message: `Daily limit reached (${limits.daily}/day). Come back tomorrow or upgrade your plan!`,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (monthCount >= effectiveMonthly) {
        return new Response(
          JSON.stringify({
            error: "limit_reached",
            message: `Monthly limit reached (${effectiveMonthly}/month). Upgrade your plan for more analyses!`,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const systemPrompt = `You are an expert dermatologist and image consultant. Analyze the face photo and return ONLY valid JSON.

VALIDATION: Reject if no face, multiple faces, or face not visible. Return: {"valid":false,"reason":"...","error_type":"no_face_detected"|"multiple_faces"}

If valid, return concise but specific analysis. Keep descriptions to 2-3 sentences max. Keep tips to 1 sentence each. Be specific to what you SEE in the photo.

SCORING: Use realistic bell curve (most people 55-75). Sub-scores MUST vary (not all within 5 points). Be honest.

Overall = symmetry*0.3 + skin*0.3 + hairstyle*0.2 + style*0.2

PERSONALIZATION: Every output must feel unique. Reference specific visible features (e.g. "mild oiliness in T-zone", "slight dark circles under eyes"). Never use generic placeholder text.

JSON format (valid face):
{
  "valid": true,
  "overall_score": <30-100>,
  "symmetry_score": <30-100>,
  "skin_score": <30-100>,
  "hairstyle_score": <30-100>,
  "style_score": <30-100>,
  "personalized_insights": [
    "<specific observation e.g. 'Mild oiliness detected in T-zone'>",
    "<specific observation e.g. 'Slight dark circles under eyes'>",
    "<specific observation e.g. 'Good facial symmetry overall'>",
    "<specific observation e.g. 'Healthy lip color and definition'>",
    "<specific observation e.g. 'Minor forehead texture unevenness'>"
  ],
  "category_breakdown": {
    "skin_quality": {
      "score": <30-100>,
      "explanation": "<1 sentence about what AI observed>",
      "suggestion": "<1 sentence actionable improvement>"
    },
    "symmetry": {
      "score": <30-100>,
      "explanation": "<1 sentence about symmetry observations>",
      "suggestion": "<1 sentence improvement or maintenance tip>"
    },
    "glow_level": {
      "score": <30-100>,
      "explanation": "<1 sentence about radiance/luminosity>",
      "suggestion": "<1 sentence to boost glow>"
    },
    "acne_risk": {
      "score": <30-100>,
      "explanation": "<1 sentence about pore/blemish observations>",
      "suggestion": "<1 sentence preventive action>"
    }
  },
  "glow_potential": {
    "improvement_percent": <5-30>,
    "message": "<e.g. 'You can improve up to 18% with proper hydration and sun protection'>"
  },
  "ai_confidence": {
    "level": "high"|"moderate"|"low",
    "reason": "<e.g. 'Good lighting and clear frontal angle'>"
  },
  "analysis_data": {
    "symmetry": {
      "description": "<2-3 sentences referencing specific features>",
      "details": [
        {"label": "Eye Alignment", "value": <30-100>},
        {"label": "Nose Centering", "value": <30-100>},
        {"label": "Jawline Balance", "value": <30-100>},
        {"label": "Lip Symmetry", "value": <30-100>}
      ],
      "tips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"]
    },
    "skin": {
      "description": "<2-3 sentences: texture, pigmentation, hydration, specific conditions>",
      "details": [
        {"label": "Texture", "value": <30-100>},
        {"label": "Clarity", "value": <30-100>},
        {"label": "Tone Evenness", "value": <30-100>},
        {"label": "Hydration", "value": <30-100>}
      ],
      "tips": ["<AM tip>", "<PM tip>", "<targeted treatment>", "<lifestyle tip>"],
      "product_suggestions": [
        {"name": "<product>", "reason": "<why>", "category": "skincare"},
        {"name": "<product>", "reason": "<why>", "category": "skincare"},
        {"name": "<product>", "reason": "<why>", "category": "skincare"}
      ]
    },
    "hairstyle": {
      "description": "<2-3 sentences about hair>",
      "face_shape": "<face shape>",
      "suggestions": [
        {"name": "<style>", "match": <60-98>, "description": "<2 sentences>"},
        {"name": "<style>", "match": <60-98>, "description": "<2 sentences>"},
        {"name": "<style>", "match": <60-98>, "description": "<2 sentences>"}
      ],
      "product_suggestions": [
        {"name": "<product>", "reason": "<why>", "category": "haircare"},
        {"name": "<product>", "reason": "<why>", "category": "haircare"}
      ]
    },
    "style": {
      "description": "<2-3 sentences about style>",
      "color_analysis": "<seasonal color type>",
      "recommendations": [
        {"category": "Color Palette", "tip": "<specific>", "priority": "high"},
        {"category": "Grooming", "tip": "<specific>", "priority": "high"},
        {"category": "Wardrobe", "tip": "<specific>", "priority": "medium"},
        {"category": "Accessories", "tip": "<specific>", "priority": "medium"}
      ],
      "product_suggestions": [
        {"name": "<product>", "reason": "<why>", "category": "grooming"},
        {"name": "<product>", "reason": "<why>", "category": "style"}
      ]
    },
    "summary": "<2-3 sentence summary>"
  }
}

CRITICAL: Keep responses CONCISE. Short sentences. Ensure complete JSON. Every insight must be UNIQUE to what you see — never generic.`;

    // Call AI with retry logic
    const MAX_RETRIES = 2;
    let analysis = null;
    let lastError = "";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            max_tokens: 4000,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this face photo. Be concise and specific. Return valid JSON only.",
                  },
                  { type: "image_url", image_url: { url: photo_url } },
                ],
              },
            ],
          }),
        }
      );

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI gateway error:", aiResponse.status, errText);
        if (aiResponse.status === 429) {
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          return new Response(
            JSON.stringify({ error: "Rate limited, please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        lastError = `AI error: ${aiResponse.status}`;
        if (attempt < MAX_RETRIES) continue;
        throw new Error(lastError);
      }

      const aiData = await aiResponse.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      try {
        analysis = JSON.parse(content);
        break; // success
      } catch {
        console.error(`Attempt ${attempt + 1}: Failed to parse AI JSON (length: ${content.length})`);
        lastError = "AI returned invalid JSON";
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
      }
    }

    if (!analysis) {
      throw new Error(lastError || "Analysis failed after retries");
    }

    // Handle validation failure
    if (!analysis.valid) {
      const errorType = analysis.error_type || "no_face_detected";
      const defaultMessages: Record<string, string> = {
        no_face_detected: "No clear human face was detected. Please upload a front-facing selfie with your face clearly visible.",
        multiple_faces: "Multiple faces were detected. Please upload a photo with only your face visible.",
      };

      return new Response(
        JSON.stringify({
          error: errorType,
          message: analysis.reason || defaultMessages[errorType] || defaultMessages.no_face_detected,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Clamp scores and calculate weighted average
    const clamp = (v: number, min = 30, max = 100) => Math.max(min, Math.min(max, Math.round(Number(v) || 55)));
    const sym = clamp(analysis.symmetry_score);
    const skin = clamp(analysis.skin_score);
    const hair = clamp(analysis.hairstyle_score);
    const style = clamp(analysis.style_score);
    const calculatedOverall = Math.round(sym * 0.3 + skin * 0.3 + hair * 0.2 + style * 0.2);

    analysis.overall_score = calculatedOverall;
    analysis.symmetry_score = sym;
    analysis.skin_score = skin;
    analysis.hairstyle_score = hair;
    analysis.style_score = style;

    // Save to database — include new personalized fields in analysis_data
    const shareToken = crypto.randomUUID();
    const enrichedAnalysisData = {
      ...analysis.analysis_data,
      personalized_insights: analysis.personalized_insights || [],
      category_breakdown: analysis.category_breakdown || {},
      glow_potential: analysis.glow_potential || { improvement_percent: 10, message: "Room for improvement with consistent care" },
      ai_confidence: analysis.ai_confidence || { level: "moderate", reason: "Standard image quality" },
    };

    const { data: inserted, error: insertError } = await adminClient
      .from("analysis_history")
      .insert({
        user_id: user.id,
        overall_score: calculatedOverall,
        symmetry_score: sym,
        skin_score: skin,
        hairstyle_score: hair,
        style_score: style,
        photo_url: storage_path || photo_url,
        analysis_data: enrichedAnalysisData,
        share_token: shareToken,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save analysis");
    }

    return new Response(
      JSON.stringify({
        id: inserted.id,
        share_token: shareToken,
        ...analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-photo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
