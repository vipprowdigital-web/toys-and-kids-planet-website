// app/features/service/components/form.tsx

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
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useGetServiceByIdQuery,
  useGetPublicServiceNamesQuery,
} from "../data/serviceApi";
import { RichTextEditor } from "~/components/crud/RichTextEditor";
import { useGetDomainsQuery } from "~/features/domains/data/domainsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Combobox } from "~/components/crud/Combobox";

// Validation helper
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  else if (values.title.length < 3)
    errors.title = "Title must be at least 3 characters.";
  else if (values.title.length > 100)
    errors.title = "Title cannot exceed 100 characters.";

  if (!values.domain) errors.domain = "Domain is required.";

  if (values.subHeading && values.subHeading.length > 300)
    errors.subHeading = "Subheading cannot exceed 300 characters.";

  if (!values.description.trim())
    errors.description = "Description is required.";
  else if (values.description.length < 10)
    errors.description = "Description must be at least 10 characters.";
  else if (values.description.length > 20000)
    errors.description = "Description cannot exceed 20000 characters.";

  return errors;
};

export default function ServiceForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || !!id;

  const { data: domainData } = useGetDomainsQuery({ page: 1, limit: 50 });
  const domainOptions =
    domainData?.data?.map((domain: any) => ({
      value: domain._id,
      label: domain.name,
    })) || [];

  const { data, isLoading } = useGetPublicServiceNamesQuery();
  const services = data?.data ?? [];

  // ✅ API Hooks
  const { data: serviceData, isLoading: loadingService } =
    useGetServiceByIdQuery(id ?? "", { skip: !isEdit });
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  // ✅ Local State
  const [values, setValues] = useState({
    title: "",
    domain: "",
    subHeading: "",
    description: "",
    thumbnail: null as string | null,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Prefill for Edit Mode
  useEffect(() => {
    if (serviceData?.data) {
      const s = serviceData.data;
      setValues({
        title: s.title || "",
        domain: s.domain?._id || s.domain || "",
        subHeading: s.subHeading || "",
        description: s.description || "",
        thumbnail: s.thumbnail || null,
        isActive: s.isActive ?? true,
      });
    }
  }, [serviceData]);

  // ✅ File Upload (Thumbnail)
  const [
    { files: thumbFiles, isDragging: thumbDrag, errors: thumbErrors },
    thumbHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 2 * 1024 * 1024 });

  const thumbPreview = thumbFiles?.[0]?.preview || values.thumbnail || null;

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
      formData.append("domain", values.domain);
      formData.append("subHeading", values.subHeading.trim());
      formData.append("description", values.description.trim());
      formData.append("isActive", String(values.isActive));

      if (thumbFiles.length > 0)
        formData.append("thumbnail", thumbFiles[0].file as Blob);

      if (isEdit) {
        if (!id) {
          toast.error("Missing service ID for update.");
          setIsSubmitting(false);
          return;
        }
        await updateService({ id, formData }).unwrap();
        toast.success("✅ Service updated successfully!");
      } else {
        await createService(formData).unwrap();
        toast.success("✅ Service created successfully!");

        if (actionType === "create_another") {
          setValues({
            title: "",
            subHeading: "",
            domain: "",
            description: "",
            thumbnail: null,
            isActive: true,
          });
          setErrors({});
          return;
        }
      }

      navigate("/admin/service");
    } catch (err: any) {
      toast.error(err?.data?.message || "❌ Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Loader for Edit Mode
  if (loadingService && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading service details...
        </span>
      </div>
    );
  }

  // ✅ Form UI
  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Service" : "Create Service"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing service details below."
            : "Fill out the form to create a new service."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Enter the service details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="mb-2">Title</Label>
                  <Input
                    value={values.title}
                    placeholder="Enter service title"
                    required={true}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Domain */}
                <div>
                  <Label className="mb-2">Domain</Label>
                  <Combobox
                    options={domainOptions}
                    value={values.domain}
                    onChange={(e) => handleChange("domain", e)}
                  />
                  {errors.domain && (
                    <p className="text-xs text-red-500 mt-1">{errors.domain}</p>
                  )}
                </div>

                {/* Subheading */}
                <div>
                  <Label className="mb-2">Sub Heading</Label>
                  <Input
                    value={values.subHeading}
                    placeholder="Enter sub heading (optional)"
                    onChange={(e) => handleChange("subHeading", e.target.value)}
                    className={errors.subHeading ? "border-red-500" : ""}
                  />
                  {errors.subHeading && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.subHeading}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  {/* Description */}
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

            {/* THUMBNAIL UPLOAD */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={thumbHandlers.handleDragEnter}
                  onDragLeave={thumbHandlers.handleDragLeave}
                  onDragOver={thumbHandlers.handleDragOver}
                  onDrop={thumbHandlers.handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${
                    thumbDrag ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <input
                    {...thumbHandlers.getInputProps()}
                    className="sr-only"
                  />
                  {thumbPreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={thumbPreview}
                        alt="Thumbnail Preview"
                        className="object-cover h-full w-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (thumbFiles.length > 0)
                            thumbHandlers.removeFile(thumbFiles[0]?.id);
                          setValues((p) => ({ ...p, thumbnail: null }));
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
                        onClick={thumbHandlers.openFileDialog}
                      >
                        <UploadIcon className="h-4 w-4 mr-2" /> Select Image
                      </Button>
                    </div>
                  )}
                </div>
                {thumbErrors[0] && (
                  <p className="text-xs text-red-500 mt-1">{thumbErrors[0]}</p>
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
            onClick={() => navigate("/admin/service")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
