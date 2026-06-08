// app/features/support/components/form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, UploadIcon, XIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

// import {
//   useCreateSupportMutation,
//   useUpdateBlogMutation,
//   useGetBlogByIdQuery,
// } from "../data/blogApi";

import { useGetCategoriesQuery } from "~/features/category/data/categoryApi";
import { RichTextEditor } from "~/components/crud/RichTextEditor";
import { Combobox } from "@/components/crud/Combobox";

// ------------------ VALIDATION ------------------
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  // Title
  if (!values.title.trim()) {
    errors.title = "Title is required.";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  } else if (values.title.trim().length > 150) {
    errors.title = "Title cannot exceed 150 characters.";
  }

  // Short Description
  if (!values.short_description.trim()) {
    errors.short_description = "Short description is required.";
  } else if (values.short_description.trim().length > 300) {
    errors.short_description =
      "Short description cannot exceed 300 characters.";
  }

  // Description
  if (!values.description.trim()) {
    errors.description = "Description is required.";
  }

  // Category (optional, but if exists, must be valid)
  if (values.category && typeof values.category !== "string") {
    errors.category = "Invalid category selected.";
  }

  return errors;
};

export default function SupportForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit" || !!id;

  // ------------------ QUERIES ------------------
  // const { data: blogData, isLoading: loadingBlog } = useGetBlogByIdQuery(id!, {
  //   skip: !isEdit,
  // });

  const { data: categoryData } = useGetCategoriesQuery({ page: 1, limit: 100 });

  // const [createBlog] = useCreateBlogMutation();
  // const [updateBlog] = useUpdateBlogMutation();
  const SHORT_DESC_LIMIT = 300;

  // ------------------ FORM STATE ------------------
  const [values, setValues] = useState({
    title: "",
    category: "",
    short_description: "",
    description: "",
    thumbnail: null as string | null,
    gallery_images: [] as string[],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
    isActive: true,
    isFeature: false,
  });

  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------ FILE UPLOAD HOOKS ------------------
  const [
    { files: thumbFiles, isDragging: thumbDrag, errors: thumbErrors },
    thumbHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 5 * 1024 * 1024 });

  const [
    { files: galleryFiles, isDragging: galleryDrag, errors: galleryErrors },
    galleryHandlers,
  ] = useFileUpload({
    accept: "image/*",
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  });

  const thumbPreview = thumbFiles[0]?.preview || values.thumbnail || null;

  const galleryPreviews = [
    ...(values.gallery_images || []),
    ...galleryFiles.map((f) => f.preview),
  ];

  // ------------------ PREFILL FORM ON EDIT ------------------
  // useEffect(() => {
    // if (!blogData?.data) return;

    // const b = blogData.data;

    // setValues({
    //   title: b.title || "",
    //   category:
    //     b.category && typeof b.category === "object"
    //       ? (b.category as any)._id
    //       : b.category || "",
    //   short_description: b.short_description || "",
    //   description: b.description || "",
    //   thumbnail: b.thumbnail || null,
    //   gallery_images: b.gallery_images || [],
    //   seo: {
    //     metaTitle: b.seo?.metaTitle || "",
    //     metaDescription: b.seo?.metaDescription || "",
    //     metaKeywords: Array.isArray(b.seo?.metaKeywords)
    //       ? b.seo.metaKeywords.join(", ")
    //       : b.seo?.metaKeywords || "",
    //   },
    //   isActive: b.isActive ?? true,
    //   isFeature: b.isFeature ?? false,
    // });

  //   thumbHandlers.clearFiles();
  //   galleryHandlers.clearFiles();
  // }, [blogData]);

  // ------------------ CHANGE HANDLER ------------------
  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ------------------ REMOVE GALLERY IMAGE ------------------
  const handleRemoveGalleryImage = (src: string) => {
    if (values.gallery_images.includes(src)) {
      setRemovedImages((prev) => [...prev, src]);
      setValues((prev) => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((img) => img !== src),
      }));
    } else {
      const file = galleryFiles.find((f) => f.preview === src);
      if (file) galleryHandlers.removeFile(file.id);
    }
  };

  // ------------------ SUBMIT HANDLER ------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate(values);
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      return setErrors(newErrors);
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Basic Fields
      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("description", values.description);
      formData.append("isActive", String(values.isActive));
      formData.append("isFeature", String(values.isFeature));
      if (values.category) formData.append("category", values.category);

      // SEO
      formData.append("seo[metaTitle]", values.seo.metaTitle);
      formData.append("seo[metaDescription]", values.seo.metaDescription);
      const keywordsArr = values.seo.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      formData.append("seo[metaKeywords]", JSON.stringify(keywordsArr));

      // Thumbnail
      if (thumbFiles.length > 0) {
        formData.append("thumbnail", thumbFiles[0].file as Blob);
      }

      // Gallery → Keep + Remove + Add new
      formData.append("keep_gallery", JSON.stringify(values.gallery_images));
      formData.append("remove_gallery", JSON.stringify(removedImages));

      galleryFiles.forEach((f) =>
        formData.append("gallery_images", f.file as Blob)
      );

      // if (isEdit) {
      //   await updateBlog({ id: id!, formData }).unwrap();
      //   toast.success("Blog updated successfully!");
      // } else {
      //   await createBlog(formData).unwrap();
      //   toast.success("Blog created successfully!");
      // }

      navigate("/admin/support");
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------ UI ------------------
  // if (loadingSupport && isEdit) {
  //   return (
  //     <div className="flex justify-center py-20">
  //       <Loader2 className="h-6 w-6 animate-spin" />
  //     </div>
  //   );
  // }

  const categoryOptions =
    categoryData?.data?.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Support" : "Create Support"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* MAIN INFORMATION */}
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label className="mb-2">Tittle</Label>
                  <Input
                    value={values.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label className="mb-2">Type</Label>
                  <Combobox
                    options={categoryOptions}
                    value={values.category}
                    onChange={(v) => handleChange("category", v)}
                  />
                </div>

                {/* SHORT DESCRIPTION */}
                <div>
                  <Label className="mb-2">Message</Label>
                  <Textarea
                    value={values.short_description}
                    onChange={(e) =>
                      handleChange("short_description", e.target.value)
                    }
                    className={`resize-none ${
                      values.short_description.length > SHORT_DESC_LIMIT
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />

                  <div className="flex justify-between mt-1">
                    {values.short_description.length > SHORT_DESC_LIMIT ? (
                      <p className="text-xs text-red-500">
                        Short description must be under {SHORT_DESC_LIMIT}{" "}
                        characters
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {values.short_description.length}/{SHORT_DESC_LIMIT}{" "}
                        characters
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <RichTextEditor
                  value={values.description}
                  onChange={(v) => handleChange("description", v)}
                  error={errors.description}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Meta Title"
                  value={values.seo.metaTitle}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      seo: { ...p.seo, metaTitle: e.target.value },
                    }))
                  }
                />

                <Textarea
                  placeholder="Meta Description"
                  value={values.seo.metaDescription}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      seo: { ...p.seo, metaDescription: e.target.value },
                    }))
                  }
                />

                <Input
                  placeholder="meta1, meta2"
                  value={values.seo.metaKeywords}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      seo: { ...p.seo, metaKeywords: e.target.value },
                    }))
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between p-3 border rounded">
                  Active
                  <Switch
                    checked={values.isActive}
                    onCheckedChange={(v) => handleChange("isActive", v)}
                  />
                </div>

                <div className="flex justify-between p-3 border rounded">
                  Featured
                  <Switch
                    checked={values.isFeature}
                    onCheckedChange={(v) => handleChange("isFeature", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed p-6 rounded-xl ${
                    thumbDrag ? "border-primary bg-accent" : ""
                  }`}
                  onDragEnter={thumbHandlers.handleDragEnter}
                  onDragLeave={thumbHandlers.handleDragLeave}
                  onDragOver={thumbHandlers.handleDragOver}
                  onDrop={thumbHandlers.handleDrop}
                >
                  <input
                    {...thumbHandlers.getInputProps()}
                    className="sr-only"
                  />

                  {thumbPreview ? (
                    <div className="relative h-48">
                      <img
                        src={thumbPreview}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                        onClick={() => {
                          thumbHandlers.clearFiles();
                          setValues((p) => ({ ...p, thumbnail: null }));
                        }}
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 mx-auto opacity-70" />
                      <p className="text-sm mt-2">Upload thumbnail</p>

                      {/* FIXED: Add type="button" */}
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={thumbHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                    </div>
                  )}
                </div>

                {thumbErrors[0] && (
                  <p className="text-xs text-red-500">{thumbErrors[0]}</p>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Gallery Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed p-6 rounded-xl ${
                    galleryDrag ? "border-primary bg-accent" : ""
                  }`}
                  onDragEnter={galleryHandlers.handleDragEnter}
                  onDragLeave={galleryHandlers.handleDragLeave}
                  onDragOver={galleryHandlers.handleDragOver}
                  onDrop={galleryHandlers.handleDrop}
                >
                  <input
                    {...galleryHandlers.getInputProps()}
                    className="sr-only"
                  />

                  {galleryPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {galleryPreviews.map((src) => (
                        <div key={src} className="relative">
                          <img
                            src={src}
                            className="h-24 w-full object-cover rounded"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                            onClick={() => src && handleRemoveGalleryImage(src)}
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 mx-auto opacity-70" />
                      <p className="text-sm mt-2">Upload gallery images</p>

                      {/* FIXED: Add type="button" */}
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={galleryHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Images
                      </Button>
                    </div>
                  )}
                </div>

                {galleryErrors[0] && (
                  <p className="text-xs text-red-500">{galleryErrors[0]}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-6 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/support")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
