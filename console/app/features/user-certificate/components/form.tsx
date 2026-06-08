// app/features/user-certificate/components/form.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, FileText, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useFileUpload } from "@/hooks/use-file-upload";

import {
  useCreateUserCertificateMutation,
  useUpdateUserCertificateMutation,
  useGetUserCertificateByIdQuery,
} from "../data/user-certificateApi";

/* ================================
   📘 Types
================================ */
type FormValues = {
  name: string;
  phone: string;
  email: string;
};

/* ================================
   🔍 Validation
================================ */
const validate = (
  values: FormValues,
  isEdit: boolean,
  hasPdf: boolean
) => {
  const errors: Partial<Record<keyof FormValues | "pdf", string>> = {};

  if (!values.name.trim()) errors.name = "User name is required";
  if (!/^[0-9]{10}$/.test(values.phone))
    errors.phone = "Enter valid 10 digit phone number";
  if (!values.email.includes("@"))
    errors.email = "Enter a valid email address";

  if (!isEdit && !hasPdf) {
    errors.pdf = "Certificate PDF is required";
  }

  return errors;
};

export default function UserCertificateForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" && !!id;

  /* ================================
     🧲 API Hooks
  ================================ */
  const { data, isLoading } = useGetUserCertificateByIdQuery(id!, {
    skip: !isEdit,
  });

  const [createUserCertificate] = useCreateUserCertificateMutation();
  const [updateUserCertificate] = useUpdateUserCertificateMutation();

  /* ================================
     📤 File Upload (PDF – 2MB)
  ================================ */
  const [
    { files: pdfFiles, isDragging, errors: pdfErrors },
    pdfHandlers,
  ] = useFileUpload({
    accept: "application/pdf",
    maxSize: 2 * 1024 * 1024, // ✅ 2 MB
    multiple: false,
  });

  /* ================================
     🧩 State
  ================================ */
  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
  });

  const [existingPdf, setExistingPdf] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================================
     🧼 Prefill (Edit)
  ================================ */
  useEffect(() => {
    if (data?.data && isEdit) {
      setValues({
        name: data.data.name,
        phone: data.data.phone,
        email: data.data.email,
      });
      setExistingPdf(data.data.pdfUrl || null);
      pdfHandlers.clearFiles();
    }
  }, [data, isEdit]);

  const handleChange = (name: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  /* ================================
     📤 Submit
  ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(
      values,
      isEdit,
      pdfFiles.length > 0 || !!existingPdf
    );

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors as Record<string, string>);
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("email", values.email);

      if (pdfFiles.length > 0) {
        formData.append("certificate_pdf", pdfFiles[0].file as Blob);
      }

      if (isEdit && id) {
        await updateUserCertificate({ id, data: formData }).unwrap();
        toast.success("User certificate updated successfully!");
      } else {
        await createUserCertificate(formData).unwrap();
        toast.success("Certificate uploaded successfully!");
      }

      navigate("/admin/user-certificate");
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================================
     ⏳ Loader
  ================================ */
  if (isLoading && isEdit) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading certificate...
        </span>
      </div>
    );
  }

  /* ================================
     🎨 UI
  ================================ */
  return (
    <div className="p-6 w-full max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">
          {isEdit ? "Edit User Certificate" : "Upload User Certificate"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter user details and upload certificate PDF (max 2MB)
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate PDF</CardTitle>
              <CardDescription>Only PDF • Max 2MB</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-6 transition ${
                  isDragging ? "border-primary bg-accent" : "border-border"
                }`}
                onDragEnter={pdfHandlers.handleDragEnter}
                onDragLeave={pdfHandlers.handleDragLeave}
                onDragOver={pdfHandlers.handleDragOver}
                onDrop={pdfHandlers.handleDrop}
              >
                <input {...pdfHandlers.getInputProps()} className="sr-only" />

                {pdfFiles.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium">
                      {pdfFiles[0].file.name}
                    </span>
                    <button
                      type="button"
                      className="ml-auto p-1 rounded-full bg-black/60 text-white"
                      onClick={() => pdfHandlers.removeFile(pdfFiles[0].id)}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : existingPdf ? (
                  <a
                    href={existingPdf}
                    target="_blank"
                    className="flex items-center gap-2 text-primary underline text-sm"
                  >
                    <FileText className="h-4 w-4" /> View existing PDF
                  </a>
                ) : (
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto opacity-70" />
                    <p className="text-sm mt-2">Drop or select PDF</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={pdfHandlers.openFileDialog}
                    >
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Select PDF
                    </Button>
                  </div>
                )}
              </div>

              {(errors.pdf || pdfErrors[0]) && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.pdf || pdfErrors[0]}
                </p>
              )}
            </CardContent>
          </Card>

          {/* USER INFO */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-3">User Name</Label>
                <Input
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <Label className="mb-3">Phone</Label>
                <Input
                  value={values.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label className="mb-3">Email</Label>
                <Input
                  value={values.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {isEdit ? "Save Changes" : "Upload Certificate"}
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/admin/user-certificate")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
