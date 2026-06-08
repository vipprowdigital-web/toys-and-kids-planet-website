// app/features/course/components/form.tsx

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

import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useGetCourseByIdQuery,
} from "../data/courseApi";

import { useGetCategoriesQuery } from "~/features/category/data/categoryApi";
import { RichTextEditor } from "~/components/crud/RichTextEditor";
import { Combobox } from "@/components/crud/Combobox";

/* ---------------------------------------------
      VALIDATION
--------------------------------------------- */
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  else if (values.title.trim().length < 3)
    errors.title = "Title must be at least 3 characters.";

  if (!values.short_description.trim()) {
    errors.short_description = "Short description is required.";
  } else if (values.short_description.length > 300) {
    errors.short_description =
      "Short description must be under 300 characters.";
  }

  if (!values.description.trim())
    errors.description = "Description is required.";

  return errors;
};

/* ---------------------------------------------
      FORM COMPONENT
--------------------------------------------- */
export default function CourseForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit" || !!id;

  /* ---------------------------------------------
        QUERIES
  --------------------------------------------- */
  const { data: courseData, isLoading: loadingCourse } = useGetCourseByIdQuery(
    id!,
    { skip: !isEdit }
  );

  const { data: categoryData } = useGetCategoriesQuery({
    page: 1,
    limit: 100,
  });

  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const SHORT_DESC_LIMIT = 300;

  /* ---------------------------------------------
        FORM STATE
  --------------------------------------------- */
  const [values, setValues] = useState({
    title: "",
    category: "",
    short_description: "",
    description: "",
    level: "beginner",
    duration: "",
    price: "",
    sale_price: "",
    lessons_count: "",
    intro_video: "",

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

  /* ---------------------------------------------
        FILE UPLOADS
  --------------------------------------------- */
  const [
    { files: thumbFiles, isDragging: thumbDrag, errors: thumbErrors },
    thumbHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 5 * 1024 * 1024 });

  const [
    { files: galleryFiles, isDragging: galleryDrag, errors: galleryErrors },
    galleryHandlers,
  ] = useFileUpload({ accept: "image/*", multiple: true });

  const thumbPreview = thumbFiles[0]?.preview || values.thumbnail || null;

  const galleryPreviews = [
    ...(values.gallery_images || []),
    ...galleryFiles.map((f) => f.preview),
  ];

  /* ---------------------------------------------
        PREFILL ON EDIT
  --------------------------------------------- */
  useEffect(() => {
    if (!courseData?.data) return;

    const c = courseData.data;

    setValues({
      title: c.title || "",
      category:
        c.category && typeof c.category === "object"
          ? (c.category as any)?._id
          : c.category || "",
      short_description: c.short_description || "",
      description: c.description || "",
      level: c.level || "beginner",
      duration: c.duration || "",
      price: c.price || "",
      sale_price: c.sale_price || "",
      lessons_count: c.lessons_count || "",
      intro_video: c.intro_video || "",

      thumbnail: c.thumbnail || null,
      gallery_images: c.gallery_images || [],

      seo: {
        metaTitle: c.seo?.metaTitle || "",
        metaDescription: c.seo?.metaDescription || "",
        metaKeywords: Array.isArray(c.seo?.metaKeywords)
          ? c.seo.metaKeywords.join(", ")
          : c.seo?.metaKeywords || "",
      },

      isActive: c.isActive ?? true,
      isFeature: c.isFeature ?? false,
    });

    thumbHandlers.clearFiles();
    galleryHandlers.clearFiles();
  }, [courseData]);

  /* ---------------------------------------------
        CHANGE HANDLER
  --------------------------------------------- */

  const handleChange = (name: string, value: any) => {
    if (name === "short_description" && value.length > 500) return;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------
        REMOVE GALLERY IMAGE
  --------------------------------------------- */
  const handleRemoveGalleryImage = (src: string) => {
    if (values.gallery_images.includes(src)) {
      setRemovedImages((prev) => [...prev, src]);
      setValues((prev) => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((i) => i !== src),
      }));
    } else {
      const file = galleryFiles.find((f) => f.preview === src);
      if (file) galleryHandlers.removeFile(file.id);
    }
  };

  /* ---------------------------------------------
        SUBMIT HANDLER
  --------------------------------------------- */
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

      /* BASIC FIELDS */
      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("description", values.description);

      formData.append("level", values.level);
      formData.append("duration", values.duration);
      if (values.price) formData.append("price", values.price);
      if (values.sale_price) formData.append("sale_price", values.sale_price);
      if (values.lessons_count)
        formData.append("lessons_count", values.lessons_count);
      if (values.intro_video)
        formData.append("intro_video", values.intro_video);

      formData.append("isActive", String(values.isActive));
      formData.append("isFeature", String(values.isFeature));

      if (values.category) formData.append("category", values.category);

      /* SEO */
      formData.append("seo[metaTitle]", values.seo.metaTitle);
      formData.append("seo[metaDescription]", values.seo.metaDescription);

      const keywordsArr = values.seo.metaKeywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      formData.append("seo[metaKeywords]", JSON.stringify(keywordsArr));

      /* THUMBNAIL */
      if (thumbFiles.length > 0) {
        formData.append("thumbnail", thumbFiles[0].file as Blob);
      }

      /* GALLERY */
      formData.append("keep_gallery", JSON.stringify(values.gallery_images));
      formData.append("remove_gallery", JSON.stringify(removedImages));

      galleryFiles.forEach((f) =>
        formData.append("gallery_images", f.file as Blob)
      );

      /* SUBMIT */
      if (isEdit) {
        await updateCourse({ id: id!, formData }).unwrap();
        toast.success("Course updated successfully!");
      } else {
        await createCourse(formData).unwrap();
        toast.success("Course created successfully!");
      }

      navigate("/admin/course");
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------
        LOADING (IF EDIT)
  --------------------------------------------- */
  if (loadingCourse && isEdit) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const categoryOptions =
    categoryData?.data?.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  /* ---------------------------------------------
        FORM UI
  --------------------------------------------- */
  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Course" : "Create Course"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* -------- LEFT SECTION -------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* MAIN INFO */}
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* TITLE */}
                <div>
                  <Label className="mb-2">Title</Label>
                  <Input
                    value={values.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={
                      values.title.length > 150
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />

                  {values.title.length > 150 && (
                    <p className="text-xs text-red-500">
                      Title must be under 150 characters
                    </p>
                  )}
                </div>

                {/* CATEGORY */}
                <div>
                  <Label className="mb-2">Category</Label>
                  <Combobox
                    options={categoryOptions}
                    value={values.category}
                    onChange={(v) => handleChange("category", v)}
                  />
                </div>

                {/* LEVEL */}
                <div>
                  <Label className="mb-2">Level</Label>
                  <select
                    className="border rounded p-2 w-full"
                    value={values.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* DURATION */}
                <div>
                  <Label className="mb-2">Duration</Label>
                  <Input
                    placeholder="e.g. 6 hours, 4 weeks"
                    value={values.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                  />
                </div>

                {/* PRICE */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Price (₹)</Label>
                    <Input
                      type="number"
                      value={values.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Sale Price (₹)</Label>
                    <Input
                      type="number"
                      value={values.sale_price}
                      onChange={(e) =>
                        handleChange("sale_price", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* LESSON COUNT */}
                <div>
                  <Label className="mb-2">Lessons Count</Label>
                  <Input
                    type="number"
                    value={values.lessons_count}
                    onChange={(e) =>
                      handleChange("lessons_count", e.target.value)
                    }
                  />
                </div>

                {/* INTRO VIDEO */}
                <div>
                  <Label className="mb-2">
                    Intro Video URL (YouTube/Vimeo)
                  </Label>
                  <Input
                    placeholder="https://youtube.com/..."
                    value={values.intro_video}
                    onChange={(e) =>
                      handleChange("intro_video", e.target.value)
                    }
                  />
                </div>

                {/* SHORT DESCRIPTION */}
                <div>
                  <Label className="mb-2">Short Description</Label>
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

                {/* DESCRIPTION */}
                <RichTextEditor
                  value={values.description}
                  onChange={(v) => handleChange("description", v)}
                  error={errors.description}
                />
              </CardContent>
            </Card>

            {/* --------------------------------------------- */}
            {/* SEO */}
            {/* --------------------------------------------- */}
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

          {/* -------- RIGHT SECTION -------- */}
          <div className="space-y-6">
            {/* STATUS */}
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

            {/* THUMBNAIL */}
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={thumbHandlers.openFileDialog}
                        className="mt-2"
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

            {/* GALLERY */}
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
                            onClick={() => handleRemoveGalleryImage(src)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
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

                      <Button
                        type="button"
                        variant="outline"
                        onClick={galleryHandlers.openFileDialog}
                        className="mt-2"
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
            {isEdit ? "Save Changes" : "Create Course"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/course")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
