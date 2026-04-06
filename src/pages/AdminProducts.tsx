import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  image_url: string;
  affiliate_link: string;
  tag: string | null;
  rating: number | null;
  is_active: boolean;
  sort_order: number;
}

const emptyProduct = {
  name: "",
  brand: "",
  category: "skincare",
  description: "",
  price: "",
  image_url: "",
  affiliate_link: "",
  tag: "",
  rating: 4.5,
  is_active: true,
  sort_order: 0,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("affiliate_products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading products", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (p: AffiliateProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      affiliate_link: p.affiliate_link,
      tag: p.tag || "",
      rating: p.rating ?? 4.5,
      is_active: p.is_active,
      sort_order: p.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.affiliate_link.trim()) {
      toast({ title: "Name and affiliate link are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      description: form.description.trim(),
      price: form.price.trim(),
      image_url: form.image_url.trim(),
      affiliate_link: form.affiliate_link.trim(),
      tag: form.tag?.trim() || null,
      rating: form.rating,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    if (editingId) {
      const { error } = await supabase.from("affiliate_products").update(payload).eq("id", editingId);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Product updated ✅" });
    } else {
      const { error } = await supabase.from("affiliate_products").insert(payload);
      if (error) toast({ title: "Add failed", description: error.message, variant: "destructive" });
      else toast({ title: "Product added ✅" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("affiliate_products").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Product deleted" }); fetchProducts(); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("affiliate_products").update({ is_active: !current }).eq("id", id);
    fetchProducts();
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Link to="/products" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold">
            Manage <span className="gradient-text">Affiliate Products</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-4">Add, edit, or remove products with affiliate links.</p>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gradient-bg border-0 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Product Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CeraVe Moisturizer" />
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="CeraVe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="haircare">Haircare</SelectItem>
                      <SelectItem value="makeup">Makeup</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price</Label>
                  <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹599 or $19.99" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief product description..." rows={2} />
              </div>
              <div>
                <Label>Affiliate Link *</Label>
                <Input value={form.affiliate_link} onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })} placeholder="https://amzn.to/..." />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://images.example.com/product.jpg" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Tag (optional)</Label>
                  <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Best Seller" />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active (visible to users)</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gradient-bg border-0 text-primary-foreground">
                {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products yet. Click "Add Product" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id} className={`rounded-2xl ${!p.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                    {p.tag && <Badge variant="secondary" className="text-xs">{p.tag}</Badge>}
                    {!p.is_active && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.category} · {p.price}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => toggleActive(p.id, p.is_active)} title={p.is_active ? "Hide" : "Show"}>
                    <Switch checked={p.is_active} className="pointer-events-none scale-75" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {p.affiliate_link && p.affiliate_link !== "#" && (
                    <Button size="icon" variant="ghost" asChild>
                      <a href={p.affiliate_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
