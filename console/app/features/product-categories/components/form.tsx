// app/features/product-category/components/form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ImageIcon, UploadIcon, XIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useGetProductCategoryByIdQuery,
} from "../data/productCategoryApi";

export default function ProductCategoryForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  // 🧠 Extract as slugOrId to match your custom backend variable signature
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || !!id;

  // Pass it directly into your query hook
  const { data: categoryData, isLoading: loadingCategory } =
    useGetProductCategoryByIdQuery(id, { skip: !isEdit });
  const [createCategory] = useCreateProductCategoryMutation();
  const [updateCategory] = useUpdateProductCategoryMutation();

  const [values, setValues] = useState({
    name: "",
    description: "",
    isActive: true,
    image: null as string | null,
  });

  useEffect(() => {
    if (categoryData?.data) {
      const c = categoryData.data;
      setValues({
        name: c.name || "",
        description: c.description || "",
        isActive: c.isActive ?? true,
        image: c.image?.url || null, // Safely mapping the nested object layout url
      });
    }
  }, [categoryData]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [
    { files: imageFiles, isDragging: imageDrag, errors: imageErrors },
    imageHandlers,
  ] = useFileUpload({
    accept: "image/*",
    maxSize: 2 * 1024 * 1024,
  });

  const imagePreview = imageFiles?.[0]?.preview || values?.image || null;

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, actionType = "save") => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("isActive", String(values.isActive));

    if (imageFiles.length > 0) {
      formData.append("image", imageFiles[0].file as Blob);
    }

    try {
      if (isEdit) {
        await updateCategory({ id: id, formData }).unwrap();
        toast.success("Product category updated successfully!");
      } else {
        await createCategory(formData).unwrap();
        toast.success("Product category created successfully!");
        if (actionType === "create_another") {
          setValues({ name: "", description: "", isActive: true, image: null });
          if (imageFiles.length > 0) imageHandlers.removeFile(imageFiles[0].id);
          return;
        }
      }
      navigate("/admin/product-categories");
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCategory && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading product category details...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Product Category" : "Create Product Category"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update details of this hardware product collection."
            : "Define a new architectural category."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT INFORMATION CONTAINER */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Specifications</CardTitle>
                <CardDescription>
                  Enter primary nomenclature and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="mb-2 block">Category Name</Label>
                  <Input
                    value={values.name}
                    placeholder="e.g., Cabinet Pull Handles, Mortise Handles"
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Description</Label>
                  <Textarea
                    value={values.description}
                    placeholder="Describe scope or dimensional parameters of hardware items in this category..."
                    rows={4}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT MEDIA & SETTINGS CONTROL PANEL */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active State
                  </Label>
                  <Switch
                    id="isActive"
                    checked={values.isActive}
                    onCheckedChange={(v) => handleChange("isActive", v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visual Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="mb-2 block">Cover Image</Label>
                  <div
                    onDragEnter={imageHandlers.handleDragEnter}
                    onDragLeave={imageHandlers.handleDragLeave}
                    onDragOver={imageHandlers.handleDragOver}
                    onDrop={imageHandlers.handleDrop}
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 ${
                      imageDrag ? "bg-accent border-primary" : "border-border"
                    }`}
                  >
                    <input
                      {...imageHandlers.getInputProps()}
                      className="sr-only"
                    />
                    {imagePreview ? (
                      <div className="relative w-full h-44">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="object-cover h-full w-full rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (imageFiles.length > 0)
                              imageHandlers.removeFile(imageFiles[0]?.id);
                            setValues((p) => ({ ...p, image: null }));
                          }}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 opacity-60 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drop or click to upload
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={imageHandlers.openFileDialog}
                        >
                          <UploadIcon className="h-3 w-3 mr-2" /> Select Image
                        </Button>
                      </div>
                    )}
                  </div>
                  {imageErrors[0] && (
                    <p className="text-xs text-red-500 mt-1">
                      {imageErrors[0]}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex gap-3 pt-4 border-t">
          {isEdit ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "save")}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "create_another")}
              >
                Create & Add Another
              </Button>
            </>
          )}
          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate("/admin/product-categories")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
