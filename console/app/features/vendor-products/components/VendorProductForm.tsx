import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  useGetVendorProductByIdQuery,
} from "../data/vendorProductApi";
import { useGetProductCategoriesAllQuery } from "~/features/product-categories/data/productCategoryApi";
import { XIcon, Loader2 } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";

const AGE_GROUPS = ["0-2", "3-5", "6-8", "9-12", "13+", "all"] as const;
const BADGES = ["Best Seller", "New Arrival", "Hot Deal", "Top Rated", "STEM Pick", "Popular", "Premium"];

interface Props {
  mode: "create" | "edit";
}

export default function VendorProductForm({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: existingData } = useGetVendorProductByIdQuery(id!, { skip: mode !== "edit" || !id });
  const { data: categoriesData } = useGetProductCategoriesAllQuery({});

  const [createProduct, { isLoading: creating }] = useCreateVendorProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateVendorProductMutation();
  const isSubmitting = creating || updating;

  const [values, setValues] = useState({
    name: "", description: "", categoryId: "", ageGroup: "all" as string,
    price: "", originalPrice: "", badge: "", inStock: true, stockQuantity: "",
    specMaterial: "", specDimensions: "", specWeight: "", isActive: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && existingData?.data) {
      const p = existingData.data;
      const catId = typeof p.category === "string" ? p.category : (p.category as any)?._id ?? "";
      setValues({
        name: p.name ?? "",
        description: p.description ?? "",
        categoryId: catId,
        ageGroup: p.ageGroup ?? "all",
        price: String(p.price ?? ""),
        originalPrice: p.originalPrice ? String(p.originalPrice) : "",
        badge: p.badge ?? "",
        inStock: p.inStock ?? true,
        stockQuantity: String(p.stockQuantity ?? ""),
        specMaterial: p.specifications?.material ?? "",
        specDimensions: p.specifications?.dimensions ?? "",
        specWeight: p.specifications?.weight ?? "",
        isActive: p.isActive ?? true,
      });
      setImagePreviews(p.images?.map((img) => img.url) ?? []);
    }
  }, [existingData, mode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Name is required.";
    if (!values.description.trim()) e.description = "Description is required.";
    if (!values.categoryId) e.categoryId = "Category is required.";
    if (!values.price || Number(values.price) <= 0) e.price = "Valid price is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("description", values.description);
    fd.append("category", values.categoryId);
    fd.append("ageGroup", values.ageGroup);
    fd.append("price", values.price);
    if (values.originalPrice) fd.append("originalPrice", values.originalPrice);
    if (values.badge) fd.append("badge", values.badge);
    fd.append("inStock", String(values.inStock));
    if (values.stockQuantity) fd.append("stockQuantity", values.stockQuantity);
    fd.append("isActive", String(values.isActive));

    const specs: Record<string, string> = {};
    if (values.specMaterial) specs.material = values.specMaterial;
    if (values.specDimensions) specs.dimensions = values.specDimensions;
    if (values.specWeight) specs.weight = values.specWeight;
    if (Object.keys(specs).length) fd.append("specifications", JSON.stringify(specs));

    images.forEach((file) => fd.append("images", file));

    try {
      if (mode === "create") {
        await createProduct(fd).unwrap();
        toast.success("Product created!");
      } else {
        await updateProduct({ id: id!, formData: fd }).unwrap();
        toast.success("Product updated!");
      }
      navigate("/vendor/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const categories = (categoriesData as any)?.data ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === "create" ? "Add Product" : "Edit Product"}</h1>
        <Button variant="outline" type="button" onClick={() => navigate("/vendor/products")}>Cancel</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={4} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={values.categoryId} onValueChange={(v) => setValues({ ...values, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <Label>Age Group</Label>
              <Select value={values.ageGroup} onValueChange={(v) => setValues({ ...values, ageGroup: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGE_GROUPS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Selling Price (₹) *</Label>
              <Input id="price" type="number" min="0" value={values.price} onChange={(e) => setValues({ ...values, price: e.target.value })} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (₹)</Label>
              <Input id="originalPrice" type="number" min="0" value={values.originalPrice} onChange={(e) => setValues({ ...values, originalPrice: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input id="stockQuantity" type="number" min="0" value={values.stockQuantity} onChange={(e) => setValues({ ...values, stockQuantity: e.target.value })} />
            </div>
            <div>
              <Label>Badge</Label>
              <Select value={values.badge} onValueChange={(v) => setValues({ ...values, badge: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="No badge" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No badge</SelectItem>
                  {BADGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="inStock" checked={values.inStock} onCheckedChange={(v) => setValues({ ...values, inStock: v })} />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={values.isActive} onCheckedChange={(v) => setValues({ ...values, isActive: v })} />
              <Label htmlFor="isActive">Active (visible on site)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="specMaterial">Material</Label>
            <Input id="specMaterial" placeholder="e.g. BPA-free plastic" value={values.specMaterial} onChange={(e) => setValues({ ...values, specMaterial: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="specDimensions">Dimensions</Label>
            <Input id="specDimensions" placeholder="e.g. 30cm x 20cm" value={values.specDimensions} onChange={(e) => setValues({ ...values, specDimensions: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="specWeight">Weight</Label>
            <Input id="specWeight" placeholder="e.g. 500g" value={values.specWeight} onChange={(e) => setValues({ ...values, specWeight: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Product Images (max 5)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative h-24 w-24 rounded-md border overflow-hidden">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 5 && (
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <span className="text-2xl">+</span>
                <span className="text-xs mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <Button variant="outline" type="button" onClick={() => navigate("/vendor/products")}>Cancel</Button>
      </div>
    </form>
  );
}
