// console\app\features\feedback\components\form.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ImageIcon, Loader2, UploadIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Combobox } from "~/components/crud/Combobox";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useFileUpload } from "~/hooks/use-file-upload";

export default function FeedbackForm() {
  const navigate = useNavigate();
  const SHORT_DESC_LIMIT = 100;

  const categoryOptions = [
    { label: "Category 1", value: "1" },
    { label: "Category 2", value: "2" },
    { label: "Category 3", value: "3" },
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ------------------ FILE UPLOAD HOOKS ------------------
  const [
    { files: thumbFiles, isDragging: thumbDrag, errors: thumbErrors },
    thumbHandlers,
  ] = useFileUpload({ accept: "image/*", maxSize: 5 * 1024 * 1024 });

  // ------------------ CHANGE HANDLER ------------------
  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const thumbPreview = thumbFiles[0]?.preview || values.thumbnail || null;

  return (
    <form className="space-y-4 overflow-y-auto">
      <CardContent className="space-y-6">
        {/* Title */}
        <div>
          <Label className="mb-2">Title</Label>
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
        <div className="w-full">
          <Label className="mb-2">Category</Label>
          <Combobox
            options={categoryOptions}
            value={values.category}
            onChange={(v) => handleChange("category", v)}
             width="100%"
          />
        </div>

        {/* SHORT DESCRIPTION */}
        <div>
          <Label className="mb-2">Short Description</Label>
          <Textarea
          rows={3}
            value={values.short_description}
            onChange={(e) => handleChange("short_description", e.target.value)}
            className={`resize-none ${
              values.short_description.length > SHORT_DESC_LIMIT
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />

          <div className="flex justify-between mt-1">
            {values.short_description.length > SHORT_DESC_LIMIT ? (
              <p className="text-xs text-red-500">
                Short description must be under {SHORT_DESC_LIMIT} characters
              </p>
            ) : (
              <span className="text-xs text-muted-foreground">
                {values.short_description.length}/{SHORT_DESC_LIMIT} characters
              </span>
            )}
          </div>
        </div>

        {/* Bug Media */}

        <div className="">
          <Label className="mb-2">Short Description</Label>
          <div
            className={`border-2 border-dashed p-6 pt-0 rounded-xl ${
              thumbDrag ? "border-primary bg-accent" : ""
            }`}
            onDragEnter={thumbHandlers.handleDragEnter}
            onDragLeave={thumbHandlers.handleDragLeave}
            onDragOver={thumbHandlers.handleDragOver}
            onDrop={thumbHandlers.handleDrop}
          >
            <input {...thumbHandlers.getInputProps()} className="sr-only" />

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
        </div>

        {/* FOOTER */}
        <div className="pt-2 flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            className="bg-gray-200 flex-1"
            onClick={() => navigate(-1)}
          >
            Close
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
