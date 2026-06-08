// app/features/contact/components/form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Loader2,
  Reply,
  Mail,
  Phone,
  User2,
  MessageCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

import {
  useSubmitContactMutation,
  useUpdateContactMutation,
  useRespondToContactMutation,
  useGetContactByIdQuery,
} from "../data/contactApi";

import { RichTextEditor } from "~/components/crud/RichTextEditor";

/* ------------------------------------------- */
/* VALIDATION */
/* ------------------------------------------- */
const validate = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/\S+@\S+\.\S+$/.test(values.email))
    errors.email = "Invalid email format.";
  if (!values.message.trim()) errors.message = "Message is required.";

  return errors;
};

/* ------------------------------------------- */
/* MAIN FORM COMPONENT */
/* ------------------------------------------- */
export default function ContactForm({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isEdit = Boolean(id);

  const { data: contactData, isLoading } = useGetContactByIdQuery(id, {
    skip: !isEdit,
  });

  const [submitContact] = useSubmitContactMutation();
  const [updateContact] = useUpdateContactMutation();
  const [respondToContact] = useRespondToContactMutation();

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "new",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Load Data */
  useEffect(() => {
    if (contactData?.data) {
      const c = contactData.data;

      setValues({
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        subject: c.subject || "",
        message: c.message || "",
        status: c.status || "new",
      });
    }
  }, [contactData]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /* SEND ADMIN REPLY */
  const handleSendReply = async () => {
    if (!responseMessage.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    await toast.promise(
      respondToContact({ id, data: { message: responseMessage } }).unwrap(),
      {
        loading: "Sending reply...",
        success: "Reply sent successfully",
        error: "Failed to send reply",
      }
    );

    setResponseMessage("");
  };

  /* SUBMIT FORM */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error("Fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit) {
        await updateContact({ id, data: values }).unwrap();
        toast.success("Updated successfully");
      } else {
        await submitContact(values).unwrap();
        toast.success("Submitted successfully");
      }
      navigate("/admin/contact");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const c = contactData?.data;

  /* ------------------------------------------- */
  /* MODERN UI BELOW */
  /* ------------------------------------------- */
  return (
    <div className="space-y-10 p-6 max-w-6xl mx-auto w-full">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Contact Message" : "Submit Contact Message"}
        </h1>

        {isEdit && (
          <div className="flex gap-3 items-center mt-3">
            <Badge
              className={cn(
                "capitalize px-3 py-1 text-white",
                {
                  new: "bg-blue-500",
                  in_progress: "bg-amber-500",
                  answered: "bg-green-600",
                  closed: "bg-gray-500",
                }[values.status]
              )}
            >
              {values.status}
            </Badge>

            <p className="text-sm text-muted-foreground">
              Created at: {new Date(c?.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* LEFT SECTION */}
          <Card className="lg:col-span-2 shadow-sm w-full">
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>View or update user message</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-1.5">
                <Label>Name</Label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={values.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={cn("pl-10", errors.name && "border-red-500")}
                    placeholder="Enter name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={values.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={cn("pl-10", errors.email && "border-red-500")}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Phone & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={values.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="pl-10"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={values.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="pl-10"
                      placeholder="Subject"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Message</Label>
                <RichTextEditor
                  value={values.message}
                  onChange={(val) => handleChange("message", val)}
                  error={errors.message}
                />
              </div>

              {/* Status Switch */}
              <div className="flex justify-between items-center p-3 rounded-lg border">
                <Label className="text-sm font-medium">Mark as Answered</Label>
                <Switch
                  checked={values.status === "answered"}
                  onCheckedChange={(v) =>
                    handleChange("status", v ? "answered" : "in_progress")
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* RIGHT SECTION */}
          <div className="flex flex-col gap-6 w-full">
            {/* META INFO */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Meta Info</CardTitle>
                  <CardDescription>Technical details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>IP: {c?.ipAddress || "-"}</p>
                  <p>User Agent: {c?.userAgent || "-"}</p>
                  <p>
                    Updated: {new Date(c?.updatedAt).toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SEND RESPONSE */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Send Response</CardTitle>
                  <CardDescription>Reply to the user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    rows={4}
                    placeholder="Type your reply..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleSendReply}
                    disabled={!responseMessage.trim()}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Send Reply
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* REPLY HISTORY */}
            {isEdit && c?.replies?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reply History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-6">
                      {c.replies.map((r: any, i: number) => (
                        <div key={i} className="flex gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {r?.respondedBy?.slice(0, 2) || "AD"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {r?.respondedBy || "Admin"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(r.respondedAt).toLocaleString("en-IN")}
                            </p>

                            <p className="text-sm">{r.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-3 mt-8">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Submit Message"}
          </Button>

          <Button variant="outline" onClick={() => navigate("/admin/contact")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
