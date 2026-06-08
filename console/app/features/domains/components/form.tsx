// app/features/domains/components/form.tsx

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
import {
  ImageIcon,
  UploadIcon,
  XIcon,
  AlertCircleIcon,
  Loader2,
  FileImageIcon,
  ChevronDown,
} from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateDomainMutation,
  useUpdateDomainMutation,
  useGetDomainByIdQuery,
  useGetDomainsQuery,
 
} from "../data/domainsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DomainsForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit" || !!id;

  // ✅ Queries
  const { data: domainData, isLoading: loadingDomain } =
    useGetDomainByIdQuery(id, { skip: !isEdit });
  const { data: allDomains } = useGetDomainsQuery({
    page: 1,
    limit: 100,
  });

  const [createDomain] = useCreateDomainMutation();
  const [updateDomain] = useUpdateDomainMutation();

  const [values, setValues] = useState({
    name: "",
    description: "",
    parentDomain: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
    isActive: true,
    isFeatured: false,
    showInMenu: false,
    image: null,
    icon: null,
    totalBlogs: 0,
  });

  // ✅ Prefill for Edit Mode
  useEffect(() => {
    if (domainData?.data) {
      const c = domainData.data;
      setValues({
        name: c.name || "",
        description: c.description || "",
        parentDomain: c.parentDomain?._id?.toString() ?? "none",
        seo: {
          metaTitle: c.seo?.metaTitle || "",
          metaDescription: c.seo?.metaDescription || "",
          metaKeywords: c.seo?.metaKeywords?.join(", ") || "",
        },
        isActive: c.isActive ?? true,
        isFeatured: c.isFeatured ?? false,
        showInMenu: c.showInMenu ?? false,
        image: c.image || null,
        icon: c.icon || null,
        totalBlogs: c.totalBlogs || 0,
      });
    }
  }, [domainData]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [
    { files: imageFiles, isDragging: imageDrag, errors: imageErrors },
    imageHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 2 * 1024 * 1024 });

  const [
    { files: iconFiles, isDragging: iconDrag, errors: iconErrors },
    iconHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 2 * 1024 * 1024 });

  const imagePreview = imageFiles?.[0]?.preview || values?.image || null;
  const iconPreview = iconFiles?.[0]?.preview || values?.icon || null;

  const handleChange = (name: string, value: any) => {
    if (name.startsWith("seo.")) {
      const key = name.split(".")[1];
      setValues((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, actionType = "save") => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    try {
      Object.entries(values).forEach(([key, val]) => {
        if (key === "seo" && typeof val === "object" && val !== null) {
          Object.entries(val).forEach(([k, v]) => {
            formData.append(`seo[${k}]`, String(v || ""));
          });
        } else if (val !== null && val !== undefined) {
          formData.append(key, String(val));
        }
      });

      if (imageFiles.length > 0)
        formData.append("image", imageFiles[0].file as Blob);
      if (iconFiles.length > 0)
        formData.append("icon", iconFiles[0].file as Blob);

      if (isEdit) {
        await updateDomain({ id, formData }).unwrap();
        toast.success("Domain updated successfully!");
      } else {
        await createDomain(formData).unwrap();
        toast.success("Domain created successfully!");
        if (actionType === "create_another") {
          setValues({
            name: "",
            description: "",
            parentDomain: "",
            seo: { metaTitle: "", metaDescription: "", metaKeywords: "" },
            isActive: true,
            isFeatured: false,
            showInMenu: false,
            image: null,
            icon: null,
            totalBlogs: 0,
          });
          return;
        }
      }

      navigate("/admin/domains");
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDomain && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading domains details...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Domain" : "Create Domain"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing Domain details below."
            : "Fill out the form to create a new Domain."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            {/* BASIC INFO */}
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Enter the domains details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="mb-2">Name</Label>
                  <Input
                    value={values.name}
                    placeholder="Enter domain name"
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="mb-2">Description</Label>
                  <Textarea
                    value={values.description}
                    placeholder="Enter description"
                    rows={3}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2">Parent Domain</Label>
                  <Select
                    key={`${values.parentDomain}-${allDomains?.data?.length || 0}`} // 👈 FORCE UPDATE
                    value={values.parentDomain || "none"}
                    onValueChange={(v) =>
                      handleChange("parentDomain", v === "none" ? "" : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent</SelectItem>

                      {allDomains?.data
                        ?.filter((cat: any) => cat._id !== id)
                        .map((cat: any) => (
                          <SelectItem
                            key={cat._id}
                            value={cat._id.toString()} // ✅ STRING MATCH
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* SEO INFO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Optimization</CardTitle>
                <CardDescription>
                  Meta information for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2">Meta Title</Label>
                  <Input
                    value={values.seo.metaTitle}
                    onChange={(e) =>
                      handleChange("seo.metaTitle", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2">Meta Description</Label>
                  <Textarea
                    value={values.seo.metaDescription}
                    rows={3}
                    onChange={(e) =>
                      handleChange("seo.metaDescription", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2">
                    Meta Keywords (comma separated)
                  </Label>
                  <Input
                    value={values.seo.metaKeywords}
                    onChange={(e) =>
                      handleChange("seo.metaKeywords", e.target.value)
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* DISPLAY FLAGS */}
            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "isActive", label: "Active" },
                  { name: "isFeatured", label: "Featured" },
                  { name: "showInMenu", label: "Show in Menu" },
                ].map((opt) => (
                  <div
                    key={opt.name}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <Label className="mb-2" htmlFor={opt.name}>
                      {opt.label}
                    </Label>
                    <Switch
                      id={opt.name}
                      checked={!!values[opt.name as keyof typeof values]}
                      onCheckedChange={(v) => handleChange(opt.name, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* IMAGES */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* IMAGE */}
                <div>
                  <Label className="mb-2">Domain Image</Label>
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
                          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 opacity-70 mb-2" />
                        <p className="text-sm">Drop or select image</p>
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
                    <p className="text-xs text-red-500 mt-1">
                      {imageErrors[0]}
                    </p>
                  )}
                </div>

                {/* ICON */}
                <div>
                  <Label className="mb-2">Domain Icon</Label>
                  <div
                    onDragEnter={iconHandlers.handleDragEnter}
                    onDragLeave={iconHandlers.handleDragLeave}
                    onDragOver={iconHandlers.handleDragOver}
                    onDrop={iconHandlers.handleDrop}
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 ${
                      iconDrag ? "bg-accent border-primary" : "border-border"
                    }`}
                  >
                    <input
                      {...iconHandlers.getInputProps()}
                      className="sr-only"
                    />
                    {iconPreview ? (
                      <div className="relative w-24 h-24">
                        <img
                          src={iconPreview}
                          alt="Icon Preview"
                          className="object-contain h-full w-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (iconFiles.length > 0)
                              iconHandlers.removeFile(iconFiles[0]?.id);
                            setValues((p) => ({ ...p, icon: null }));
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <FileImageIcon className="h-5 w-5 opacity-70 mb-1" />
                        <p className="text-xs">Drop or upload icon</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={iconHandlers.openFileDialog}
                        >
                          <UploadIcon className="h-3 w-3 mr-1" /> Select
                        </Button>
                      </div>
                    )}
                  </div>
                  {iconErrors[0] && (
                    <p className="text-xs text-red-500 mt-1">{iconErrors[0]}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* STATS */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Total Blogs:{" "}
                    <span className="font-semibold text-foreground">
                      {values.totalBlogs}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
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
            onClick={() => navigate("/admin/domains")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
