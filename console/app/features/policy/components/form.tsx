// app/features/policy/components/form.tsx

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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useGetPolicyByIdQuery,
} from "../data/policyApi";
import { RichTextEditor } from "~/components/crud/RichTextEditor";

/* -------------------------------------------------------------------------- */
/* 🧩 Validation Helper */
/* -------------------------------------------------------------------------- */
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  else if (values.title.length < 3)
    errors.title = "Title must be at least 3 characters.";
  else if (values.title.length > 150)
    errors.title = "Title cannot exceed 150 characters.";

  if (!values.description.trim())
    errors.description = "Description is required.";
  else if (values.description.length < 10)
    errors.description = "Description must be at least 10 characters.";
  else if (values.description.length > 20000)
    errors.description = "Description cannot exceed 20000 characters.";

  return errors;
};

/* -------------------------------------------------------------------------- */
/* 🧾 Policy Form Component */
/* -------------------------------------------------------------------------- */
export default function PolicyForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" || !!id;

  // ✅ API Hooks
  const { data: policyData, isLoading: loadingPolicy } = useGetPolicyByIdQuery(
    id ?? "",
    { skip: !isEdit }
  );
  const [createPolicy] = useCreatePolicyMutation();
  const [updatePolicy] = useUpdatePolicyMutation();

  // ✅ Local State
  const [values, setValues] = useState({
    title: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Prefill for Edit Mode
  useEffect(() => {
    if (policyData?.data) {
      const p = policyData.data;
      setValues({
        title: p.title || "",
        slug: p.slug || "",
        description: p.description || "",
        isActive: p.isActive ?? true,
      });
    }
  }, [policyData]);

  // ✅ Handle Input Changes
  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* -------------------------------------------------------------------------- */
  /* 🧭 Submit Handler */
  /* -------------------------------------------------------------------------- */
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
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        isActive: values.isActive,
      };

      if (isEdit) {
        if (!id) {
          toast.error("Missing policy ID for update.");
          setIsSubmitting(false);
          return;
        }
        await updatePolicy({ id, data: payload }).unwrap();
        toast.success("Policy updated successfully!");
      } else {
        await createPolicy(payload).unwrap();
        toast.success("Policy created successfully!");

        if (actionType === "create_another") {
          setValues({
            title: "",
            slug: "",
            description: "",
            isActive: true,
          });
          setErrors({});
          return;
        }
      }

      navigate("/admin/policy");
    } catch (err: any) {
      toast.error(err?.data?.message || "❌ Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🌀 Loader for Edit Mode */
  /* -------------------------------------------------------------------------- */
  if (loadingPolicy && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading policy details...
        </span>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🧱 Form UI */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 w-full mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit Policy" : "Create Policy"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update existing policy details below."
            : "Fill out the form to create a new policy."}
        </p>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "create")} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>Enter policy details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="mb-2">Title</Label>
                  <Input
                    value={values.title}
                    placeholder="Enter policy title"
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <Label className="mb-2">Slug (optional)</Label>
                  <Input
                    value={values.slug}
                    placeholder="auto-generated-from-title"
                    onChange={(e) => handleChange("slug", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to auto-generate from title.
                  </p>
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
            onClick={() => navigate("/admin/policy")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
