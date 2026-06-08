// app/features/gallery/components/form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useGetGalleryByIdQuery,
} from "../data/galleryApi";
// import { useGetCategoriesQuery } from "~/features/category/data/categoryApi";
import { Combobox } from "@/components/crud/Combobox";

// ✅ Validation helper
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  else if (values.title.length > 150)
    errors.title = "Title cannot exceed 150 characters.";

  return errors;
};

export default function GalleryForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || !!id;

  // ✅ API Hooks
  const { data: galleryData, isLoading: loadingGallery } =
    useGetGalleryByIdQuery(id ?? "", {
      skip: !isEdit,
    });

  // const { data: categoryData, isLoading: categoryLoading } =
  //   useGetCategoriesQuery({ page: 1, limit: 100 });
  const GALLERY_CATEGORY_OPTIONS = [
    { label: "Gallery", value: "gallery" },
    // { label: "Home About Section", value: "home-about-section" },
    // { label: "Why Us Section", value: "why-us-section" },
    // { label: "Final CTA Section", value: "final-cta-section" },
  ];

  const [createGallery] = useCreateGalleryMutation();
  const [updateGallery] = useUpdateGalleryMutation();

  // ✅ Local State
  const [values, setValues] = useState({
    title: "",
    category: "",
    image: null as string | null,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Prefill for Edit Mode
  useEffect(() => {
    if (galleryData?.data) {
      const g = galleryData.data;
      setValues({
        title: g.title || "",
        category: g.category || "",
        image: g.image || null,
        isActive: g.isActive ?? true,
      });
    }
  }, [galleryData]);

  // ✅ File Upload (Image)
  const [
    { files: imageFiles, isDragging: imageDrag, errors: imageErrors },
    imageHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 2 * 1024 * 1024 });

  const imagePreview = imageFiles?.[0]?.preview || values.image || null;

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Submit Handler
  const handleSubmit = async (e: React.FormEvent, actionType = "save") => {
    e.preventDefault();

    const newErrors = validate(values);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title.trim());
      formData.append("isActive", String(values.isActive));
      if (values.category) formData.append("category", values.category);

      if (imageFiles.length > 0)
        formData.append("galleryMedia", imageFiles[0].file as Blob);

      if (isEdit) {
        if (!id) {
          toast.error("Missing gallery ID for update.");
          setIsSubmitting(false);
          return;
        }
        await updateGallery({ id, formData }).unwrap();
        toast.success("✅ Gallery updated successfully!");
      } else {
        await createGallery(formData).unwrap();
        toast.success("✅ Gallery created successfully!");

        if (actionType === "create_another") {
          setValues({
            title: "",
            category: "",
            image: null,
            isActive: true,
          });
          setErrors({});
          // ✅ Clear uploaded image preview/files
          imageHandlers.clearFiles?.();
          return;
        }
      }

      navigate("/admin/gallery");
    } catch (err: any) {
      toast.error(err?.data?.message || "❌ Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Loader for Edit Mode
  if (loadingGallery && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading gallery details...
        </span>
      </div>
    );
  }

  // ✅ Form UI
  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Gallery" : "Create Gallery"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing gallery details below."
            : "Fill out the form to create a new gallery."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Enter gallery details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="mb-2">Title</Label>
                  <Input
                    value={values.title}
                    placeholder="Enter gallery title"
                    required
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Combobox
                    options={GALLERY_CATEGORY_OPTIONS}
                    value={values.category}
                    onChange={(val) => handleChange("category", val)}
                    placeholder="Select category..."
                    width="100%"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* STATUS SWITCH */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={values.isActive}
                    onCheckedChange={(v) => handleChange("isActive", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* IMAGE UPLOAD */}
            <Card>
              <CardHeader>
                <CardTitle>Gallery Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={imageHandlers.handleDragEnter}
                  onDragLeave={imageHandlers.handleDragLeave}
                  onDragOver={imageHandlers.handleDragOver}
                  onDrop={imageHandlers.handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${
                    imageDrag ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <input
                    {...imageHandlers.getInputProps()}
                    className="sr-only"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={imagePreview}
                        alt="Image Preview"
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
                      <ImageIcon className="h-6 w-6 opacity-70 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop or select an image
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={imageHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                    </div>
                  )}
                </div>
                {imageErrors[0] && (
                  <p className="text-xs text-red-500 mt-1">{imageErrors[0]}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-3 pt-6">
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
                onClick={(e) => handleSubmit(e, "create")}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create & Create Another"
                )}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate("/admin/gallery")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
