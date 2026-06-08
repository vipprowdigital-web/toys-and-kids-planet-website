// app/features/testimonial/components/form.tsx

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
import { ImageIcon, UploadIcon, XIcon, Loader2, Star } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useGetTestimonialByIdQuery,
} from "../data/testimonialApi";
import { RichTextEditor } from "~/components/crud/RichTextEditor";

// ✅ Validation helper
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  else if (values.name.length > 100)
    errors.name = "Name cannot exceed 100 characters.";

  if (values.designation && values.designation.length > 100)
    errors.designation = "Designation cannot exceed 100 characters.";

  if (!values.description.trim())
    errors.description = "Description is required.";
  else if (values.description.length < 10)
    errors.description = "Description must be at least 10 characters.";
  else if (values.description.length > 20000)
    errors.description = "Description cannot exceed 20000 characters.";

  if (!values.rating || values.rating < 1 || values.rating > 5)
    errors.rating = "Rating must be between 1 and 5.";

  return errors;
};

export default function TestimonialForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || !!id;

  // ✅ API Hooks
  const { data: testimonialData, isLoading: loadingTestimonial } =
    useGetTestimonialByIdQuery(id ?? "", { skip: !isEdit });
  const [createTestimonial] = useCreateTestimonialMutation();
  const [updateTestimonial] = useUpdateTestimonialMutation();

  // ✅ Local State
  const [values, setValues] = useState({
    name: "",
    designation: "",
    description: "",
    avatar: null as string | null,
    rating: 5,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Prefill for Edit Mode
  useEffect(() => {
    if (testimonialData?.data) {
      const t = testimonialData.data;
      setValues({
        name: t.name || "",
        designation: t.designation || "",
        description: t.description || "",
        avatar: t.avatar || null,
        rating: t.rating ?? 5,
        isActive: t.isActive ?? true,
      });
    }
  }, [testimonialData]);

  // ✅ File Upload (Avatar)
  const [
    { files: avatarFiles, isDragging: avatarDrag, errors: avatarErrors },
    avatarHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 2 * 1024 * 1024 });

  const avatarPreview = avatarFiles?.[0]?.preview || values.avatar || null;

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
      formData.append("name", values.name.trim());
      formData.append("designation", values.designation.trim());
      formData.append("description", values.description.trim());
      formData.append("rating", String(values.rating));
      formData.append("isActive", String(values.isActive));

      if (avatarFiles.length > 0)
        formData.append("avatar", avatarFiles[0].file as Blob);

      if (isEdit) {
        if (!id) {
          toast.error("Missing testimonial ID for update.");
          setIsSubmitting(false);
          return;
        }
        await updateTestimonial({ id, formData }).unwrap();
        toast.success("✅ Testimonial updated successfully!");
      } else {
        await createTestimonial(formData).unwrap();
        toast.success("✅ Testimonial created successfully!");

        if (actionType === "create_another") {
          setValues({
            name: "",
            designation: "",
            description: "",
            avatar: null,
            rating: 5,
            isActive: true,
          });
          setErrors({});
          return;
        }
      }

      navigate("/admin/testimonial");
    } catch (err: any) {
      toast.error(err?.data?.message || "❌ Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Loader for Edit Mode
  if (loadingTestimonial && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading testimonial details...
        </span>
      </div>
    );
  }

  // ✅ Form UI
  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Testimonial" : "Create Testimonial"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing testimonial details below."
            : "Fill out the form to create a new testimonial."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Enter testimonial details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Name */}
                <div>
                  <Label className="mb-2">Name</Label>
                  <Input
                    value={values.name}
                    placeholder="Enter name"
                    required
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <Label className="mb-2">Designation</Label>
                  <Input
                    value={values.designation}
                    placeholder="Enter Designation"
                    onChange={(e) =>
                      handleChange("designation", e.target.value)
                    }
                    className={errors.designation ? "border-red-500" : ""}
                    required
                  />
                  {errors.designation && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.designation}
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <Label className="mb-2">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <Star
                        key={r}
                        className={`h-6 w-6 cursor-pointer ${
                          r <= values.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => handleChange("rating", r)}
                      />
                    ))}
                  </div>
                  {errors.rating && (
                    <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <RichTextEditor
                    value={values.description}
                    onChange={(val) => handleChange("description", val)}
                    error={errors.description}
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

            {/* AVATAR UPLOAD */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={avatarHandlers.handleDragEnter}
                  onDragLeave={avatarHandlers.handleDragLeave}
                  onDragOver={avatarHandlers.handleDragOver}
                  onDrop={avatarHandlers.handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${
                    avatarDrag ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <input
                    {...avatarHandlers.getInputProps()}
                    className="sr-only"
                  />
                  {avatarPreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="object-cover h-full w-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (avatarFiles.length > 0)
                            avatarHandlers.removeFile(avatarFiles[0]?.id);
                          setValues((p) => ({ ...p, avatar: null }));
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
                        Drop or select an avatar image
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={avatarHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                    </div>
                  )}
                </div>
                {avatarErrors[0] && (
                  <p className="text-xs text-red-500 mt-1">{avatarErrors[0]}</p>
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
            onClick={() => navigate("/admin/testimonial")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}