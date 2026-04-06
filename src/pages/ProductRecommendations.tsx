import { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ExternalLink, Star, Sparkles, Droplets, Palette, Scissors, AlertCircle, Settings2, Package, Plus } from "lucide-react";
import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number | null;
  price: string;
  image_url: string;
  description: string;
  affiliate_link: string;
  tag?: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  skincare: <Droplets className="w-4 h-4" />,
  haircare: <Scissors className="w-4 h-4" />,
  makeup: <Palette className="w-4 h-4" />,
  tools: <Sparkles className="w-4 h-4" />,
};

const ProductCard = ({ product }: { product: Product }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="rounded-2xl hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover"
              loading="lazy"
              width={64}
              height={64}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {product.tag && (
            <Badge className="gradient-bg border-0 text-primary-foreground text-xs">{product.tag}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="font-display font-semibold text-sm mt-1 mb-2">{product.name}</h3>
        <p className="text-xs text-muted-foreground flex-1">{product.description}</p>
        <div className="flex items-center gap-1 mt-3 mb-4">
          {product.rating && (
            <>
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-xs font-medium">{product.rating}</span>
            </>
          )}
          <span className="text-xs text-muted-foreground ml-auto font-display font-bold">{product.price}</span>
        </div>
        <Button size="sm" className="w-full gradient-bg border-0 text-primary-foreground gap-2" asChild>
          <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer">
            View Product <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const ProductRecommendations = () => {
  const [tab, setTab] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const fromAnalysis = (location.state as any)?.fromAnalysis;
  const { analysis } = useLatestAnalysis();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("affiliate_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const insights = useMemo(() => {
    if (!analysis) return [];
    const tips: { icon: React.ReactNode; text: string; category: string }[] = [];
    const skinData = analysis.analysis_data?.skin;
    const hairstyleData = analysis.analysis_data?.hairstyle;
    const styleData = analysis.analysis_data?.style;

    if (skinData?.description && analysis.skin_score != null) {
      tips.push({
        icon: <Droplets className="w-4 h-4 text-primary shrink-0 mt-0.5" />,
        text: analysis.skin_score < 75
          ? `Skin Score ${analysis.skin_score}% — ${skinData.tips?.[0] || "Focus on hydration and sun protection to improve your skin health."}`
          : `Skin Score ${analysis.skin_score}% — Your skin looks healthy! Maintain with a consistent routine.`,
        category: "skincare",
      });
    }
    if (hairstyleData?.description && analysis.hairstyle_score != null) {
      tips.push({
        icon: <Scissors className="w-4 h-4 text-primary shrink-0 mt-0.5" />,
        text: analysis.hairstyle_score < 75
          ? `Hairstyle Score ${analysis.hairstyle_score}% — ${hairstyleData.face_shape ? `With your ${hairstyleData.face_shape} face shape, try styles that balance your proportions.` : "Consider a style that better complements your face shape."}`
          : `Hairstyle Score ${analysis.hairstyle_score}% — Great match! Your current style suits your face shape well.`,
        category: "haircare",
      });
    }
    if (styleData?.description && analysis.style_score != null) {
      tips.push({
        icon: <Palette className="w-4 h-4 text-primary shrink-0 mt-0.5" />,
        text: analysis.style_score < 75
          ? `Style Score ${analysis.style_score}% — ${styleData.recommendations?.[0]?.tip || "Experiment with colors and accessories to elevate your look."}`
          : `Style Score ${analysis.style_score}% — Looking sharp! Your presentation is well put together.`,
        category: "makeup",
      });
    }
    if (tips.length === 0) {
      tips.push({ icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Great scores! Browse our top picks to maintain and enhance your glow.", category: "all" });
    }
    return tips;
  }, [analysis]);

  const aiProductSuggestions = useMemo(() => {
    if (!analysis?.analysis_data) return [];
    const suggestions: { name: string; reason: string; category: string }[] = [];
    const { skin, hairstyle, style } = analysis.analysis_data;
    if (skin?.product_suggestions) suggestions.push(...skin.product_suggestions);
    if (hairstyle?.product_suggestions) suggestions.push(...hairstyle.product_suggestions);
    if (style?.product_suggestions) suggestions.push(...style.product_suggestions);
    return suggestions;
  }, [analysis]);

  const sortedProducts = useMemo(() => {
    if (!analysis || !fromAnalysis) return products;
    const weakCategories: string[] = [];
    if (analysis.skin_score != null && analysis.skin_score < 75) weakCategories.push("skincare");
    if (analysis.hairstyle_score != null && analysis.hairstyle_score < 75) weakCategories.push("haircare");
    if (analysis.style_score != null && analysis.style_score < 75) weakCategories.push("makeup", "tools");
    if (weakCategories.length === 0) return products;
    return [...products].sort((a, b) => {
      const aRelevant = weakCategories.includes(a.category) ? 0 : 1;
      const bRelevant = weakCategories.includes(b.category) ? 0 : 1;
      return aRelevant - bRelevant;
    });
  }, [analysis, fromAnalysis, products]);

  const filtered = tab === "all" ? sortedProducts : sortedProducts.filter((p) => p.category === tab);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Recommended <span className="gradient-text">Products</span> ✨
            </h1>
            <p className="text-muted-foreground">Curated beauty products to enhance your glow-up journey.</p>
          </div>
          {isAdmin && (
            <Link to="/admin/products">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="w-4 h-4" /> Manage
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {analysis && insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <Card className="rounded-2xl gradient-bg-subtle border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Based on Your Analysis</h3>
                  <p className="text-xs text-muted-foreground">Overall score: {analysis.overall_score}%</p>
                </div>
              </div>
              <div className="space-y-2">
                {insights.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    {tip.icon}
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI-Recommended Products from Analysis */}
      {analysis && aiProductSuggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Recommended For You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiProductSuggestions.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Card className="rounded-xl h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.category === "skincare" && <Droplets className="w-4 h-4 text-primary" />}
                      {item.category === "haircare" && <Scissors className="w-4 h-4 text-primary" />}
                      {(item.category === "grooming" || item.category === "tools" || item.category === "makeup") && <Palette className="w-4 h-4 text-primary" />}
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    </div>
                    <h4 className="font-display font-semibold text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!analysis && (
        <Card className="rounded-2xl gradient-bg-subtle border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Personalized For You</h3>
              <p className="text-sm text-muted-foreground">
                Upload a selfie first to get product recommendations tailored to your specific needs.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg text-sm">All</TabsTrigger>
          <TabsTrigger value="skincare" className="rounded-lg text-sm gap-1.5">
            {categoryIcons.skincare} Skincare
          </TabsTrigger>
          <TabsTrigger value="haircare" className="rounded-lg text-sm gap-1.5">
            {categoryIcons.haircare} Haircare
          </TabsTrigger>
          <TabsTrigger value="makeup" className="rounded-lg text-sm gap-1.5">
            {categoryIcons.makeup} Makeup
          </TabsTrigger>
          <TabsTrigger value="tools" className="rounded-lg text-sm gap-1.5">
            {categoryIcons.tools} Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No products in this category yet.</p>
                {isAdmin && (
                  <Link to="/admin/products">
                    <Button variant="outline" size="sm" className="mt-3 gap-2">
                      <Plus className="w-4 h-4" /> Add Products
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="rounded-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Products are recommended based on beauty analysis insights. Links may contain affiliate partnerships.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductRecommendations;
