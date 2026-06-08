// app/features/products/components/form.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, XIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductByIdQuery,
} from "../data/productApi";
import { Combobox } from "@/components/crud/Combobox";
import  TagsInput  from "@/components/crud/TagsInput";
import {
  useGetProductCategoriesAllQuery,
} from "~/features/product-categories/data/productCategoryApi";

// ── Types ──────────────────────────────────────────────────────────────────

const AGE_GROUPS = ["0-2", "3-5", "6-8", "9-12", "13+", "all"] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

const BADGES = [
  "Best Seller",
  "New Arrival",
  "Hot Deal",
  "Top Rated",
  "STEM Pick",
  "Popular",
  "Premium",
] as const;

/** One row in the optional variants section */
interface VariantFormRow {
  _id?: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  discountPrice: string;
  isAvailable: boolean;
}

interface FormValues {
  name: string;
  description: string;
  categoryId: string;
  ageGroup: AgeGroup;
  price: string;
  originalPrice: string;
  badge: string;
  inStock: boolean;
  stockQuantity: string;
  // Specifications
  specMaterial: string;
  specBatteryRequired: boolean;
  specBatteryType: string;
  specDimensions: string;
  specWeight: string;
  // Safety standards and included items are tag arrays (managed separately)
  // Flags
  isFeatured: boolean;
  isActive: boolean;
}

// ── Validation ─────────────────────────────────────────────────────────────

const validate = (values: FormValues, variants: VariantFormRow[]) => {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) errors.name = "Product name is required.";
  else if (values.name.length > 200)
    errors.name = "Name cannot exceed 200 characters.";

  if (!values.description.trim())
    errors.description = "Description is required.";

  if (!values.categoryId) errors.categoryId = "Please select a category.";

  if (!values.price || isNaN(Number(values.price)) || Number(values.price) < 0)
    errors.price = "A valid price is required.";

  if (
    values.originalPrice &&
    (isNaN(Number(values.originalPrice)) || Number(values.originalPrice) < 0)
  )
    errors.originalPrice = "Original price must be a valid non-negative number.";

  if (
    values.originalPrice &&
    values.price &&
    Number(values.originalPrice) <= Number(values.price)
  )
    errors.originalPrice =
      "Original (crossed-out) price must be higher than the selling price.";

  variants.forEach((v, i) => {
    if (v.price && isNaN(Number(v.price)))
      errors[`variant_${i}_price`] = "Price must be a number.";
    if (v.discountPrice && isNaN(Number(v.discountPrice)))
      errors[`variant_${i}_discountPrice`] =
        "Discount price must be a number.";
    if (
      v.price &&
      v.discountPrice &&
      Number(v.discountPrice) >= Number(v.price)
    )
      errors[`variant_${i}_discountPrice`] =
        "Discount price must be less than price.";
  });

  return errors;
};

const emptyVariant = (): VariantFormRow => ({
  sku: "",
  color: "",
  size: "",
  price: "",
  discountPrice: "",
  isAvailable: true,
});

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProductForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || !!id;

  const { data: productData, isLoading: loadingProduct } =
    useGetProductByIdQuery(id ?? "", { skip: !isEdit });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const { data: catData } = useGetProductCategoriesAllQuery();

  const [values, setValues] = useState<FormValues>({
    name: "",
    description: "",
    categoryId: "",
    ageGroup: "all",
    price: "",
    originalPrice: "",
    badge: "none",
    inStock: true,
    stockQuantity: "0",
    specMaterial: "",
    specBatteryRequired: false,
    specBatteryType: "",
    specDimensions: "",
    specWeight: "",
    isFeatured: false,
    isActive: true,
  });

  const [safetyStandards, setSafetyStandards] = useState<string[]>([]);
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantFormRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [
    { files: imageFiles, isDragging: imageDrag, errors: imageErrors },
    imageHandlers,
  ] = useFileUpload({
    accept: "image/*",
    maxSize: 5 * 1024 * 1024,
    multiple: true,
  });

  const [existingImages, setExistingImages] = useState<
    { url: string; publicId: string }[]
  >([]);

  const categoryOptions = useMemo(() => {
    if (!catData?.data) return [];
    const list = Array.isArray(catData.data) ? catData.data : catData;
    if (!Array.isArray(list)) return [];
    return list.map((cat: any) => ({ label: cat.name, value: cat._id }));
  }, [catData]);

  // ── Prefill for edit mode ────────────────────────────────────────────────
  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;
      setValues({
        name: p.name || "",
        description: p.description || "",
        categoryId:
          typeof p.category === "object" ? (p.category as any)._id : p.category || "",
        ageGroup: (p.ageGroup as AgeGroup) || "all",
        price: p.price != null ? String(p.price) : "",
        originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
        badge: p.badge || "none",
        inStock: p.inStock ?? true,
        stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : "0",
        specMaterial: p.specifications?.material || "",
        specBatteryRequired: p.specifications?.batteryRequired ?? false,
        specBatteryType: p.specifications?.batteryType || "",
        specDimensions: p.specifications?.dimensions || "",
        specWeight: p.specifications?.weight || "",
        isFeatured: p.isFeatured ?? false,
        isActive: p.isActive ?? true,
      });
      setSafetyStandards(p.specifications?.safetyStandards || []);
      setIncludedItems(p.specifications?.includedItems || []);
      setExistingImages(p.images || []);
      if ((p.variants?.length ?? 0) > 0) {
        setVariants(
          (p.variants ?? []).map((v: any) => ({
            _id: v._id,
            sku: v.sku || "",
            color: v.color || "",
            size: v.size || "",
            price: v.price != null ? String(v.price) : "",
            discountPrice: v.discountPrice != null ? String(v.discountPrice) : "",
            isAvailable: v.isAvailable ?? true,
          })),
        );
      }
    }
  }, [productData]);

  const handleChange = (name: keyof FormValues, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormRow,
    value: any,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
    const key = `variant_${index}_${field}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (
    e: React.FormEvent,
    actionType: "create" | "create_another" = "create",
  ) => {
    e.preventDefault();

    const newErrors = validate(values, variants);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", values.name.trim());
      formData.append("description", values.description.trim());
      formData.append("category", values.categoryId);
      formData.append("ageGroup", values.ageGroup);
      formData.append("price", values.price);
      if (values.originalPrice)
        formData.append("originalPrice", values.originalPrice);
      if (values.badge && values.badge !== "none")
        formData.append("badge", values.badge);
      formData.append("inStock", String(values.inStock));
      formData.append("stockQuantity", values.stockQuantity || "0");
      formData.append("isFeatured", String(values.isFeatured));
      formData.append("isActive", String(values.isActive));

      formData.append(
        "specifications",
        JSON.stringify({
          material: values.specMaterial.trim() || undefined,
          batteryRequired: values.specBatteryRequired,
          batteryType: values.specBatteryType.trim() || undefined,
          dimensions: values.specDimensions.trim() || undefined,
          weight: values.specWeight.trim() || undefined,
          safetyStandards: safetyStandards.length > 0 ? safetyStandards : undefined,
          includedItems: includedItems.length > 0 ? includedItems : undefined,
        }),
      );

      if (variants.length > 0) {
        formData.append(
          "variants",
          JSON.stringify(
            variants.map((v) => ({
              ...(v._id ? { _id: v._id } : {}),
              sku: v.sku.trim() || undefined,
              color: v.color.trim() || undefined,
              size: v.size.trim() || undefined,
              price: v.price ? Number(v.price) : undefined,
              discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
              isAvailable: v.isAvailable,
            })),
          ),
        );
      }

      for (const f of imageFiles) {
        formData.append("images", f.file as Blob);
      }

      if (isEdit) {
        if (!id) { toast.error("Missing product ID for update."); return; }
        await updateProduct({ id, formData }).unwrap();
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else {
        await createProduct(formData).unwrap();
        toast.success("Product created successfully!");

        if (actionType === "create_another") {
          setValues({
            name: "", description: "", categoryId: "",
            ageGroup: "all", price: "", originalPrice: "",
            badge: "none", inStock: true, stockQuantity: "0",
            specMaterial: "", specBatteryRequired: false,
            specBatteryType: "", specDimensions: "", specWeight: "",
            isFeatured: false, isActive: true,
          });
          setSafetyStandards([]);
          setIncludedItems([]);
          setVariants([]);
          setErrors({});
          setExistingImages([]);
          imageHandlers.clearFiles?.();
          return;
        }
        navigate("/admin/products");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "❌ Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading product details...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Product" : "Create Product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing product details below."
            : "Fill out the form to add a new product."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Product name, description, category and age group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Name */}
                <div>
                  <Label className="mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={values.name}
                    placeholder="e.g. Rainbow Stacking Rings"
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <Label className="mb-2">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    value={values.description}
                    placeholder="Describe this product for parents and kids..."
                    rows={4}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${
                      errors.description ? "border-red-500" : "border-input"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <Label className="mb-2">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Combobox
                      options={categoryOptions}
                      value={values.categoryId}
                      onChange={(val) => handleChange("categoryId", val)}
                      placeholder="Select a category..."
                      width="100%"
                    />
                    {errors.categoryId && (
                      <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
                    )}
                  </div>

                  {/* Age Group */}
                  <div>
                    <Label className="mb-2">
                      Age Group <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={values.ageGroup}
                      onValueChange={(v) => handleChange("ageGroup", v as AgeGroup)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="0-2">0–2 Years (Baby)</SelectItem>
                        <SelectItem value="3-5">3–5 Years (Toddler)</SelectItem>
                        <SelectItem value="6-8">6–8 Years (Kid)</SelectItem>
                        <SelectItem value="9-12">9–12 Years (Pre-teen)</SelectItem>
                        <SelectItem value="13+">13+ Years (Teen)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Selling price, original (MRP) price, and stock info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <Label className="mb-2">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={values.price}
                      placeholder="e.g. 499"
                      onChange={(e) => handleChange("price", e.target.value)}
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </div>

                  {/* Original Price (MRP) */}
                  <div>
                    <Label className="mb-2">Original / MRP Price (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={values.originalPrice}
                      placeholder="e.g. 699 (shown crossed-out)"
                      onChange={(e) => handleChange("originalPrice", e.target.value)}
                      className={errors.originalPrice ? "border-red-500" : ""}
                    />
                    {errors.originalPrice && (
                      <p className="text-xs text-red-500 mt-1">{errors.originalPrice}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Discount % is auto-calculated from these two prices.
                    </p>
                  </div>

                  {/* Stock quantity */}
                  <div>
                    <Label className="mb-2">Stock Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={values.stockQuantity}
                      placeholder="0"
                      onChange={(e) => handleChange("stockQuantity", e.target.value)}
                    />
                  </div>

                  {/* Badge */}
                  <div>
                    <Label className="mb-2">Product Badge</Label>
                    <Select
                      value={values.badge}
                      onValueChange={(v) => handleChange("badge", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Badge</SelectItem>
                        {BADGES.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Displayed as a label on the product card.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Toy Specifications</CardTitle>
                <CardDescription>Material, battery info, dimensions and safety</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Material</Label>
                    <Input
                      value={values.specMaterial}
                      placeholder="e.g. BPA-free plastic, Wood, Fabric"
                      onChange={(e) => handleChange("specMaterial", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Dimensions</Label>
                    <Input
                      value={values.specDimensions}
                      placeholder="e.g. 30cm x 20cm x 10cm"
                      onChange={(e) => handleChange("specDimensions", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Weight</Label>
                    <Input
                      value={values.specWeight}
                      placeholder="e.g. 500g"
                      onChange={(e) => handleChange("specWeight", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Battery Type</Label>
                    <Input
                      value={values.specBatteryType}
                      placeholder="e.g. AA x 3"
                      disabled={!values.specBatteryRequired}
                      onChange={(e) => handleChange("specBatteryType", e.target.value)}
                    />
                  </div>
                </div>

                {/* Battery required toggle */}
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <Label>Battery Required</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toggle on to enable the battery type field
                    </p>
                  </div>
                  <Switch
                    checked={values.specBatteryRequired}
                    onCheckedChange={(v) => handleChange("specBatteryRequired", v)}
                  />
                </div>

                {/* Safety standards */}
                <div>
                  <Label className="mb-2">Safety Standards</Label>
                  <TagsInput
                    value={safetyStandards}
                    onChange={setSafetyStandards}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Type and press Enter, e.g. "BIS", "CE", "ASTM"
                  </p>
                </div>

                {/* Included items */}
                <div>
                  <Label className="mb-2">Included Items / What's in the Box</Label>
                  <TagsInput
                    value={includedItems}
                    onChange={setIncludedItems}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Type and press Enter, e.g. "Toy car", "Remote", "Manual"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Variants — optional for toys */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Variants (Optional)</CardTitle>
                    <CardDescription className="mt-1">
                      Add colour or size options, each with its own price
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{variants.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="relative border rounded-lg p-4 space-y-4 bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        Variant {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Color */}
                      <div>
                        <Label className="mb-1.5 text-xs">Colour</Label>
                        <Input
                          value={variant.color}
                          placeholder="e.g. Red, Blue, Yellow"
                          onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                        />
                      </div>

                      {/* Size */}
                      <div>
                        <Label className="mb-1.5 text-xs">Size / Pack</Label>
                        <Input
                          value={variant.size}
                          placeholder="e.g. Small, Pack of 2, 30cm"
                          onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                        />
                      </div>

                      {/* SKU */}
                      <div>
                        <Label className="mb-1.5 text-xs">SKU (optional)</Label>
                        <Input
                          value={variant.sku}
                          placeholder="e.g. TOY-RED-SM"
                          onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <Label className="mb-1.5 text-xs">Price (₹)</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          placeholder="e.g. 499"
                          className={errors[`variant_${index}_price`] ? "border-red-500" : ""}
                          onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                        />
                        {errors[`variant_${index}_price`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`variant_${index}_price`]}
                          </p>
                        )}
                      </div>

                      {/* Discount Price */}
                      <div>
                        <Label className="mb-1.5 text-xs">Discount Price (₹)</Label>
                        <Input
                          type="number"
                          value={variant.discountPrice}
                          placeholder="e.g. 399"
                          className={errors[`variant_${index}_discountPrice`] ? "border-red-500" : ""}
                          onChange={(e) =>
                            handleVariantChange(index, "discountPrice", e.target.value)
                          }
                        />
                        {errors[`variant_${index}_discountPrice`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`variant_${index}_discountPrice`]}
                          </p>
                        )}
                      </div>

                      {/* Available */}
                      <div className="flex items-center justify-between border rounded-lg p-3">
                        <Label className="text-xs">Available</Label>
                        <Switch
                          checked={variant.isAvailable}
                          onCheckedChange={(v) => handleVariantChange(index, "isAvailable", v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4" /> Add Variant
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visible on the storefront
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={values.isActive}
                    onCheckedChange={(v) => handleChange("isActive", v)}
                  />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <Label htmlFor="isFeatured">Featured</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Show in Featured Products section
                    </p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={values.isFeatured}
                    onCheckedChange={(v) => handleChange("isFeatured", v)}
                  />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <Label htmlFor="inStock">In Stock</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Show "Add to Cart" button
                    </p>
                  </div>
                  <Switch
                    id="inStock"
                    checked={values.inStock}
                    onCheckedChange={(v) => handleChange("inStock", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Up to 5 images shown on the product page</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Existing images in edit mode */}
                {existingImages.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.url}
                          alt={`Product image ${i + 1}`}
                          className="h-20 w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {imageFiles.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {imageFiles.map((f, i) => (
                      <div key={f.id} className="relative group">
                        <img
                          src={f.preview}
                          alt={`New image ${i + 1}`}
                          className="h-20 w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => imageHandlers.removeFile(f.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                <div
                  onDragEnter={imageHandlers.handleDragEnter}
                  onDragLeave={imageHandlers.handleDragLeave}
                  onDragOver={imageHandlers.handleDragOver}
                  onDrop={imageHandlers.handleDrop}
                  onClick={imageHandlers.openFileDialog}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    imageDrag
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <input {...imageHandlers.getInputProps()} className="sr-only" />
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop images or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP — max 5MB each
                  </p>
                </div>
                {imageErrors.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">{imageErrors[0]}</p>
                )}
              </CardContent>
            </Card>

            {/* Submit buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update Product" : "Create Product"}
              </Button>

              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e as any, "create_another")}
                >
                  Save & Add Another
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
