// app/features/app-configuration/components/form.tsx

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetAppConfigurationQuery,
  useUpdateAppConfigurationMutation,
} from "../data/appConfigurationApi";
import { Loader2, Plus, Trash2, Settings } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 🧱 Types */
/* -------------------------------------------------------------------------- */
type CompanyAddress = {
  address: string;
  googleMapLocation: string;
};

type AppConfigValues = {
  appName: string;
  email: string;
  phoneNumber: string;
  companyAddress: CompanyAddress[];
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
  youtubeLink: string;
  whatsAppLink: string;
  googleFormLink: string;
  linkedinLink: string;
  googleAppStoreLink: string;
  appleAppStoreLink: string;
};

/* -------------------------------------------------------------------------- */
/* 🧩 Validation Helper */
/* -------------------------------------------------------------------------- */
const validate = (values: AppConfigValues) => {
  const errors: Record<string, string> = {};
  if (!values.appName.trim()) errors.appName = "App name is required.";
  if (!values.email.trim()) errors.email = "Email is required.";
  if (!values.phoneNumber.trim())
    errors.phoneNumber = "Phone number is required.";
  return errors;
};

/* -------------------------------------------------------------------------- */
/* 🧾 App Configuration Form */
/* -------------------------------------------------------------------------- */
export default function AppConfigurationForm({
  mode = "edit",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAppConfigurationQuery();
  const [updateAppConfiguration] = useUpdateAppConfigurationMutation();

  // ✅ State
  const [values, setValues] = useState<AppConfigValues>({
    appName: "",
    email: "",
    phoneNumber: "",
    companyAddress: [{ address: "", googleMapLocation: "" }],
    facebookLink: "",
    instagramLink: "",
    twitterLink: "",
    youtubeLink: "",
    whatsAppLink: "",
    googleFormLink: "",
    linkedinLink: "",
    googleAppStoreLink: "",
    appleAppStoreLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Prefill Data
  useEffect(() => {
    if (!data?.app_config_data) return;

    // ✅ HARD CLONE to remove RTK freeze completely
    const cleanData = JSON.parse(JSON.stringify(data.app_config_data));

    setValues({
      appName: cleanData.appName || "",
      email: cleanData.email || "",
      phoneNumber: cleanData.phoneNumber || "",
      companyAddress:
        cleanData.companyAddress?.length > 0
          ? cleanData.companyAddress
          : [{ address: "", googleMapLocation: "" }],
      facebookLink: cleanData.facebookLink || "",
      instagramLink: cleanData.instagramLink || "",
      twitterLink: cleanData.twitterLink || "",
      youtubeLink: cleanData.youtubeLink || "",
      whatsAppLink: cleanData.whatsAppLink || "",
      googleFormLink: cleanData.googleFormLink || "",
      linkedinLink: cleanData.linkedinLink || "",
      googleAppStoreLink: cleanData.googleAppStoreLink || "",
      appleAppStoreLink: cleanData.appleAppStoreLink || "",
    });
  }, [data]);

  /* --------------------------------- Handlers -------------------------------- */
  const handleChange = (name: keyof AppConfigValues, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressChange = (
    index: number,
    field: keyof CompanyAddress,
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      companyAddress: prev.companyAddress.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr,
      ),
    }));
  };

  const addAddress = () =>
    setValues((prev) => ({
      ...prev,
      companyAddress: [
        ...prev.companyAddress,
        { address: "", googleMapLocation: "" },
      ],
    }));

  const removeAddress = (index: number) => {
    const updated = values.companyAddress.filter((_, i) => i !== index);
    setValues((prev) => ({ ...prev, companyAddress: updated }));
  };

  /* -------------------------------- Submission ------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(values);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct highlighted errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAppConfiguration(values).unwrap();
      toast.success("✅ App configuration updated successfully!");
      navigate("/admin/app-configuration");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground animate-fadeIn">
        <Loader2 className="h-6 w-6 animate-spin mb-3 text-primary" />
        <p>Loading app configuration...</p>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🧱 Responsive UI Layout */
  /* -------------------------------------------------------------------------- */
  return (
    <motion.div
      className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            App Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your app’s general details, address, and social links.
          </p>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* BASIC INFO */}
        <Card className="backdrop-blur-lg bg-primary border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                label: "App Name",
                key: "appName",
                type: "text",
                placeholder: "Enter app name",
              },
              {
                label: "Email",
                key: "email",
                type: "email",
                placeholder: "Enter email address",
              },
              {
                label: "Phone Number",
                key: "phoneNumber",
                type: "text",
                placeholder: "Enter phone number",
              },
            ].map((field) => (
              <div key={field.key} className="flex flex-col">
                <Label className="mb-2 text-sm font-medium text-muted-foreground">
                  {field.label}
                </Label>
                <Input
                  type={field.type}
                  value={(values as any)[field.key]}
                  onChange={(e) =>
                    handleChange(
                      field.key as keyof AppConfigValues,
                      e.target.value,
                    )
                  }
                  placeholder={field.placeholder}
                  className={`transition-all focus:ring-2 focus:ring-primary/30 ${
                    errors[field.key] ? "border-red-500" : ""
                  }`}
                />
                {errors[field.key] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* COMPANY ADDRESS */}
        <Card className="bg-linear-to-b from-background to-muted/40 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">
              Company Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {values.companyAddress.map((addr, index) => {
              console.log("isFrozen addr:", Object.isFrozen(addr));
              return (
                <motion.div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border rounded-xl p-4 relative bg-card/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <Label className="mb-2 text-sm font-medium">Address</Label>
                    <Textarea
                      value={addr.address}
                      onChange={(e) =>
                        handleAddressChange(index, "address", e.target.value)
                      }
                      placeholder="Enter company address"
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 text-sm font-medium">
                      Google Map Link
                    </Label>
                    <Input
                      value={addr.googleMapLocation}
                      onChange={(e) =>
                        handleAddressChange(
                          index,
                          "googleMapLocation",
                          e.target.value,
                        )
                      }
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  {values.companyAddress.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 text-destructive hover:bg-destructive/10"
                      onClick={() => removeAddress(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              onClick={addAddress}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" /> Add Another Address
            </Button>
          </CardContent>
        </Card>

        {/* SOCIAL LINKS */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">
              Social & External Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {(
              [
                "facebookLink",
                "instagramLink",
                "twitterLink",
                "youtubeLink",
                "linkedinLink",
                "whatsAppLink",
                "googleFormLink",
                "googleAppStoreLink",
                "appleAppStoreLink",
              ] as (keyof AppConfigValues)[]
            ).map((field) => (
              <div key={field}>
                <Label className="text-sm mb-2 block">
                  {field.replace(/([A-Z])/g, " $1")}
                </Label>
                <Input
                  value={String(values[field] ?? "")}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
                  className="focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:justify-start gap-3 bottom-0">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="shadow-sm w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/app-configuration")}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
