// app/features/products/components/BulkUploadPage.tsx

"use client";

import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileSpreadsheet,
  FolderOpen,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useBulkUpload } from "../hooks/useBulkUpload";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ── DropZone ───────────────────────────────────────────────────────────────

interface DropZoneProps {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
  selectedFiles: File[];
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

function DropZone({
  label,
  sublabel,
  icon,
  accept,
  multiple,
  directory,
  selectedFiles,
  onFiles,
  disabled,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(false);
      const dropped = [...e.dataTransfer.files];
      if (dropped.length) onFiles(dropped);
    },
    [disabled, onFiles],
  );

  const hasFiles = selectedFiles.length > 0;
  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer select-none",
        isDragging && "border-primary bg-primary/5",
        hasFiles &&
          !isDragging &&
          "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
        !hasFiles &&
          !isDragging &&
          "border-border hover:border-muted-foreground/50 hover:bg-muted/30",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        {...(directory ? { webkitdirectory: "true" } : {})}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          if (files.length) onFiles(files);
        }}
        className="sr-only"
      />

      {hasFiles ? (
        <div className="flex flex-col items-center text-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="font-semibold text-sm text-foreground">
            {directory
              ? `${selectedFiles.length} image${selectedFiles.length !== 1 ? "s" : ""} selected`
              : selectedFiles[0].name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(totalSize)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 text-xs h-7"
            onClick={(e) => {
              e.stopPropagation();
              onFiles([]);
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
          <p className="font-semibold text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            {sublabel}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 text-xs h-7 gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            Browse
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Progress Panel ─────────────────────────────────────────────────────────

interface ProgressPanelProps {
  steps: { message: string; percent?: number }[];
  percent: number;
  isActive: boolean;
}

function ProgressPanel({ steps, percent, isActive }: ProgressPanelProps) {
  const visible = steps.slice(-8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Upload Progress
          {isActive && (
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                percent === 100 ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-right text-muted-foreground">{percent}%</p>
        </div>

        {/* Step log */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {visible.map((step, i) => {
            const isLatest = i === visible.length - 1;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 text-sm transition-opacity",
                  isLatest ? "opacity-100" : "opacity-40",
                )}
              >
                {isActive && isLatest ? (
                  <Loader2 className="h-4 w-4 mt-0.5 shrink-0 text-primary animate-spin" />
                ) : (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      isLatest ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                )}
                <span
                  className={
                    isLatest ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {step.message}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Validation Errors ──────────────────────────────────────────────────────

interface ValidationErrorsProps {
  errors: string[];
  onReset: () => void;
}

function ValidationErrors({ errors, onReset }: ValidationErrorsProps) {
  return (
    <Card className="border-amber-300 dark:border-amber-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          Validation Failed — {errors.length} error
          {errors.length !== 1 ? "s" : ""} found
        </CardTitle>
        <CardDescription>
          Nothing was uploaded. Fix the errors below in your Excel sheet, then
          re-upload.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-72 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-amber-800 dark:text-amber-300"
            >
              <span className="shrink-0 mt-0.5">•</span>
              <span>{err}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Fix &amp; Re-upload
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Result Panel ───────────────────────────────────────────────────────────

interface ResultPanelProps {
  inserted: number;
  failed: number;
  errors: string[];
  onReset: () => void;
}

function ResultPanel({ inserted, failed, errors, onReset }: ResultPanelProps) {
  const isFullSuccess = failed === 0;

  return (
    <Card
      className={cn(
        "border-2",
        isFullSuccess
          ? "border-emerald-400 dark:border-emerald-700"
          : "border-amber-300 dark:border-amber-700",
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className={cn(
            "text-base flex items-center gap-2",
            isFullSuccess
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          {isFullSuccess ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          {isFullSuccess ? "Upload Complete!" : "Upload Complete with Errors"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {inserted}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Products saved
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg p-3 text-center",
              failed > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-muted/50",
            )}
          >
            <p
              className={cn(
                "text-2xl font-bold",
                failed > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground",
              )}
            >
              {failed}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Failed</p>
          </div>
        </div>

        {failed > 0 && errors.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs text-red-700 dark:text-red-400">
            {errors.map((e, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="shrink-0">•</span>
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={onReset} className="gap-2">
            <Upload className="h-3.5 w-3.5" />
            Upload Another Batch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const {
    status,
    steps,
    percent,
    validationErrors,
    result,
    startUpload,
    reset,
  } = useBulkUpload();

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const isUploading = status === "uploading";
  const isIdle = status === "idle";
  const showForm = isIdle || isUploading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return;
    await startUpload(excelFile, imageFiles);
  };

  const handleReset = () => {
    reset();
    setExcelFile(null);
    setImageFiles([]);
  };

  return (
    <div className="p-0 space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Bulk Product Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload up to 20,000 products at once using the Excel template.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a
              href="/templates/AmbikaTraders_Product_Upload_Template.xlsx"
              download
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Template
            </a>
          </Button>
          <Button variant="ghost" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Upload form ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Select your filled Excel template and the folder containing
                    all product images. Image filenames must exactly match what
                    you entered in the sheet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DropZone
                      label="Excel Template"
                      sublabel="Drag & drop your filled .xlsx template here"
                      icon={<FileSpreadsheet className="h-6 w-6" />}
                      accept=".xlsx,.xls"
                      multiple={false}
                      selectedFiles={excelFile ? [excelFile] : []}
                      onFiles={(files) =>
                        setExcelFile(files.length ? files[0] : null)
                      }
                      disabled={isUploading}
                    />

                    <DropZone
                      label="Images Folder"
                      sublabel="Select the folder containing all product images"
                      icon={<FolderOpen className="h-6 w-6" />}
                      accept="image/*"
                      multiple={true}
                      directory={true}
                      selectedFiles={imageFiles}
                      onFiles={(files) => setImageFiles(files)}
                      disabled={isUploading}
                    />
                  </div>

                  {imageFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{imageFiles.length}</span>{" "}
                      image{imageFiles.length !== 1 ? "s" : ""} ready (
                      {formatBytes(imageFiles.reduce((s, f) => s + f.size, 0))}
                      ). Make sure these filenames exactly match the image
                      columns in your Excel sheet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isUploading || !excelFile}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Start Bulk Upload
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isUploading}
                  onClick={() => navigate("/admin/products")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {status === "validation_failed" && (
            <ValidationErrors errors={validationErrors} onReset={handleReset} />
          )}

          {status === "done" && result && (
            <ResultPanel
              inserted={result.inserted}
              failed={result.failed}
              errors={result.errors}
              onReset={handleReset}
            />
          )}

          {status === "error" && (
            <Card className="border-red-300 dark:border-red-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Upload Failed
                </CardTitle>
                <CardDescription>
                  A server error occurred. Check the progress log for details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT: Progress + Instructions ───────────────────────────── */}
        <div className="space-y-4">
          {/*
           * FIX: Show progress panel as soon as upload starts (steps.length > 0
           * is guaranteed because useBulkUpload now seeds an initial step before
           * the fetch call, so the panel is never blank during upload).
           */}
          {steps.length > 0 && (
            <ProgressPanel
              steps={steps}
              percent={percent}
              isActive={isUploading}
            />
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              {[
                {
                  step: "1",
                  title: "Download the template",
                  body: 'Click "Download Template" above and open it in Excel.',
                },
                {
                  step: "2",
                  title: "Fill in your products",
                  body: "Each row = one variant. Repeat product-level fields (name, category, specs) on every row for the same product.",
                },
                {
                  step: "3",
                  title: "Name your images",
                  body: "Use filenames with no spaces (e.g. handle_brass_96.jpg). Enter these exact filenames in the image columns.",
                },
                {
                  step: "4",
                  title: "Upload together",
                  body: "Select your Excel file and your images folder, then click Start Bulk Upload.",
                },
                {
                  step: "5",
                  title: "Fix any errors",
                  body: "If validation fails, the exact row numbers and column names will be listed. Fix them in Excel and re-upload.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-3">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                    {step}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="mt-0.5">{body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// // Admin page for bulk product upload via Excel + images folder.
// // Styled with Tailwind CSS using your existing shadcn/ui components.
// // Mirrors the structure of your GalleryForm but handles SSE progress state.

// "use client";

// import React, { useRef, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   FileSpreadsheet,
//   FolderOpen,
//   Upload,
//   CheckCircle2,
//   XCircle,
//   AlertTriangle,
//   ArrowLeft,
//   RotateCcw,
//   ChevronRight,
// } from "lucide-react";
// import { useBulkUpload } from "../hooks/useBulkUpload";
// import { cn } from "@/lib/utils";

// // ── Helpers ────────────────────────────────────────────────────────────────

// function formatBytes(bytes: number): string {
//   if (bytes === 0) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB"] as const;
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
// }

// // ── DropZone Sub-component ─────────────────────────────────────────────────
// // A reusable drag-and-drop zone. Mirrors the image upload zone in GalleryForm
// // but generalised for both Excel files and image folders.

// interface DropZoneProps {
//   label: string;
//   sublabel: string;
//   icon: React.ReactNode;
//   accept?: string;
//   multiple?: boolean;
//   /** When true, uses webkitdirectory to let the user pick an entire folder */
//   directory?: boolean;
//   selectedFiles: File[];
//   onFiles: (files: File[]) => void;
//   disabled?: boolean;
// }

// function DropZone({
//   label,
//   sublabel,
//   icon,
//   accept,
//   multiple,
//   directory,
//   selectedFiles,
//   onFiles,
//   disabled,
// }: DropZoneProps) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [isDragging, setIsDragging] = useState(false);

//   const handleDrop = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       if (disabled) return;
//       setIsDragging(false);
//       const dropped = [...e.dataTransfer.files];
//       if (dropped.length) onFiles(dropped);
//     },
//     [disabled, onFiles],
//   );

//   const hasFiles = selectedFiles.length > 0;
//   const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

//   return (
//     <div
//       onClick={() => !disabled && inputRef.current?.click()}
//       onDragOver={(e) => {
//         e.preventDefault();
//         if (!disabled) setIsDragging(true);
//       }}
//       onDragLeave={() => setIsDragging(false)}
//       onDrop={handleDrop}
//       className={cn(
//         "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer select-none",
//         isDragging && "border-primary bg-primary/5",
//         hasFiles &&
//           !isDragging &&
//           "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
//         !hasFiles &&
//           !isDragging &&
//           "border-border hover:border-muted-foreground/50 hover:bg-muted/30",
//         disabled && "pointer-events-none opacity-50",
//       )}
//     >
//       <input
//         ref={inputRef}
//         type="file"
//         accept={accept}
//         multiple={multiple}
//         // webkitdirectory is not in React's HTMLInputElement types but it works
//         // in all modern browsers and is the standard way to pick a folder.
//         {...(directory ? { webkitdirectory: "true" } : {})}
//         onChange={(e) => {
//           const files = [...(e.target.files ?? [])];
//           if (files.length) onFiles(files);
//         }}
//         className="sr-only"
//       />

//       {hasFiles ? (
//         <div className="flex flex-col items-center text-center gap-2">
//           <CheckCircle2 className="h-8 w-8 text-emerald-500" />
//           <p className="font-semibold text-sm text-foreground">
//             {directory
//               ? `${selectedFiles.length} image${selectedFiles.length !== 1 ? "s" : ""} selected`
//               : selectedFiles[0].name}
//           </p>
//           <p className="text-xs text-muted-foreground">
//             {formatBytes(totalSize)}
//           </p>
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             className="mt-1 text-xs h-7"
//             onClick={(e) => {
//               e.stopPropagation();
//               onFiles([]);
//             }}
//           >
//             Change
//           </Button>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center text-center gap-2">
//           <div className="p-3 rounded-full bg-muted text-muted-foreground">
//             {icon}
//           </div>
//           <p className="font-semibold text-sm text-foreground">{label}</p>
//           <p className="text-xs text-muted-foreground max-w-[200px]">
//             {sublabel}
//           </p>
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             className="mt-2 text-xs h-7 gap-1.5"
//           >
//             <Upload className="h-3.5 w-3.5" />
//             Browse
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Progress Panel Sub-component ───────────────────────────────────────────

// interface ProgressPanelProps {
//   steps: { message: string; percent?: number }[];
//   percent: number;
//   isActive: boolean;
// }

// function ProgressPanel({ steps, percent, isActive }: ProgressPanelProps) {
//   // We only show the last 6 steps to avoid the panel growing too tall.
//   // Earlier steps scroll out naturally as new ones come in.
//   const visible = steps.slice(-6);

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-base flex items-center gap-2">
//           Upload Progress
//           {isActive && (
//             <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
//           )}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Progress bar */}
//         <div className="h-2 rounded-full bg-muted overflow-hidden">
//           <div
//             className={cn(
//               "h-full rounded-full transition-all duration-500",
//               percent === 100 ? "bg-emerald-500" : "bg-primary",
//             )}
//             style={{ width: `${percent}%` }}
//           />
//         </div>
//         <p className="text-xs text-right text-muted-foreground -mt-2">
//           {percent}%
//         </p>

//         {/* Step log */}
//         <div className="space-y-1.5">
//           {visible.map((step, i) => {
//             const isLatest = i === visible.length - 1;
//             return (
//               <div
//                 key={i}
//                 className={cn(
//                   "flex items-start gap-2 text-sm transition-opacity",
//                   isLatest ? "opacity-100" : "opacity-50",
//                 )}
//               >
//                 <ChevronRight
//                   className={cn(
//                     "h-4 w-4 mt-0.5 shrink-0",
//                     isLatest ? "text-primary" : "text-muted-foreground",
//                   )}
//                 />
//                 <span
//                   className={
//                     isLatest ? "text-foreground" : "text-muted-foreground"
//                   }
//                 >
//                   {step.message}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ── ValidationErrors Sub-component ────────────────────────────────────────

// interface ValidationErrorsProps {
//   errors: string[];
//   onReset: () => void;
// }

// function ValidationErrors({ errors, onReset }: ValidationErrorsProps) {
//   return (
//     <Card className="border-amber-300 dark:border-amber-700">
//       <CardHeader className="pb-3">
//         <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
//           <AlertTriangle className="h-4 w-4" />
//           Validation Failed — {errors.length} error
//           {errors.length !== 1 ? "s" : ""} found
//         </CardTitle>
//         <CardDescription>
//           Nothing was uploaded. Fix the errors below in your Excel sheet, then
//           re-upload.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <div className="max-h-72 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
//           {errors.map((err, i) => (
//             <div
//               key={i}
//               className="flex items-start gap-2 text-amber-800 dark:text-amber-300"
//             >
//               <span className="shrink-0 mt-0.5">•</span>
//               <span>{err}</span>
//             </div>
//           ))}
//         </div>
//         <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
//           <RotateCcw className="h-3.5 w-3.5" />
//           Fix &amp; Re-upload
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// // ── Result Panel Sub-component ─────────────────────────────────────────────

// interface ResultPanelProps {
//   inserted: number;
//   failed: number;
//   errors: string[];
//   onReset: () => void;
// }

// function ResultPanel({ inserted, failed, errors, onReset }: ResultPanelProps) {
//   const isFullSuccess = failed === 0;

//   return (
//     <Card
//       className={cn(
//         "border-2",
//         isFullSuccess
//           ? "border-emerald-400 dark:border-emerald-700"
//           : "border-amber-300 dark:border-amber-700",
//       )}
//     >
//       <CardHeader className="pb-3">
//         <CardTitle
//           className={cn(
//             "text-base flex items-center gap-2",
//             isFullSuccess
//               ? "text-emerald-700 dark:text-emerald-400"
//               : "text-amber-700 dark:text-amber-400",
//           )}
//         >
//           {isFullSuccess ? (
//             <CheckCircle2 className="h-5 w-5" />
//           ) : (
//             <AlertTriangle className="h-5 w-5" />
//           )}
//           {isFullSuccess ? "Upload Complete!" : "Upload Complete with Errors"}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <div className="grid grid-cols-2 gap-3">
//           <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
//             <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
//               {inserted}
//             </p>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               Products saved
//             </p>
//           </div>
//           <div
//             className={cn(
//               "rounded-lg p-3 text-center",
//               failed > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-muted/50",
//             )}
//           >
//             <p
//               className={cn(
//                 "text-2xl font-bold",
//                 failed > 0
//                   ? "text-red-600 dark:text-red-400"
//                   : "text-muted-foreground",
//               )}
//             >
//               {failed}
//             </p>
//             <p className="text-xs text-muted-foreground mt-0.5">Failed</p>
//           </div>
//         </div>

//         {failed > 0 && errors.length > 0 && (
//           <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs text-red-700 dark:text-red-400">
//             {errors.map((e, i) => (
//               <div key={i} className="flex items-start gap-1.5">
//                 <span className="shrink-0">•</span>
//                 <span>{e}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="flex gap-2 pt-1">
//           <Button size="sm" onClick={onReset} className="gap-2">
//             <Upload className="h-3.5 w-3.5" />
//             Upload Another Batch
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────────────────────

// export default function BulkUploadPage() {
//   const navigate = useNavigate();
//   const {
//     status,
//     steps,
//     percent,
//     validationErrors,
//     result,
//     startUpload,
//     reset,
//   } = useBulkUpload();

//   const [excelFile, setExcelFile] = useState<File | null>(null);
//   const [imageFiles, setImageFiles] = useState<File[]>([]);

//   const isUploading = status === "uploading";
//   const isIdle = status === "idle";
//   const showForm = isIdle || isUploading;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!excelFile) return;
//     await startUpload(excelFile, imageFiles);
//   };

//   const handleReset = () => {
//     reset();
//     setExcelFile(null);
//     setImageFiles([]);
//   };

//   return (
//     <div className="p-0 space-y-6">
//       {/* ── Header — matches GalleryPage header style ─────────────────────── */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold">Bulk Product Upload</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Upload up to 20,000 products at once using the Excel template.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           {/* Template download — put the .xlsx in your public/templates/ folder */}
//           <Button variant="outline" asChild>
//             <a
//               href="/templates/AmbikaTraders_Product_Upload_Template.xlsx"
//               download
//             >
//               <FileSpreadsheet className="mr-2 h-4 w-4" />
//               Download Template
//             </a>
//           </Button>
//           <Button variant="ghost" onClick={() => navigate("/admin/products")}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Products
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* ── LEFT: Upload form ────────────────────────────────────────────── */}
//         <div className="lg:col-span-2 space-y-4">
//           {showForm && (
//             <form onSubmit={handleSubmit}>
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Upload Files</CardTitle>
//                   <CardDescription>
//                     Select your filled Excel template and the folder containing
//                     all product images. Image filenames must exactly match what
//                     you entered in the sheet.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {/* Excel file picker */}
//                     <DropZone
//                       label="Excel Template"
//                       sublabel="Drag & drop your filled .xlsx template here"
//                       icon={<FileSpreadsheet className="h-6 w-6" />}
//                       accept=".xlsx,.xls"
//                       multiple={false}
//                       selectedFiles={excelFile ? [excelFile] : []}
//                       onFiles={(files) =>
//                         setExcelFile(files.length ? files[0] : null)
//                       }
//                       disabled={isUploading}
//                     />

//                     {/* Images folder picker */}
//                     <DropZone
//                       label="Images Folder"
//                       sublabel="Select the folder containing all product images"
//                       icon={<FolderOpen className="h-6 w-6" />}
//                       accept="image/*"
//                       multiple={true}
//                       directory={true}
//                       selectedFiles={imageFiles}
//                       onFiles={(files) => setImageFiles(files)}
//                       disabled={isUploading}
//                     />
//                   </div>

//                   {/* Tip: images are optional */}
//                   {imageFiles.length > 0 && (
//                     <p className="text-xs text-muted-foreground">
//                       <span className="font-medium">{imageFiles.length}</span>{" "}
//                       image
//                       {imageFiles.length !== 1 ? "s" : ""} ready (
//                       {formatBytes(imageFiles.reduce((s, f) => s + f.size, 0))}
//                       ). Make sure these filenames exactly match the image
//                       columns in your Excel sheet.
//                     </p>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* ── Footer buttons — same pattern as GalleryForm ─────────── */}
//               <div className="flex gap-3 pt-4">
//                 <Button type="submit" disabled={isUploading || !excelFile}>
//                   {isUploading ? (
//                     <>
//                       <span className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
//                       Uploading…
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="mr-2 h-4 w-4" />
//                       Start Bulk Upload
//                     </>
//                   )}
//                 </Button>
//                 <Button
//                   variant="outline"
//                   type="button"
//                   disabled={isUploading}
//                   onClick={() => navigate("/admin/products")}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           )}

//           {/* ── Validation errors (replaces form on validation_failed) ──── */}
//           {status === "validation_failed" && (
//             <ValidationErrors errors={validationErrors} onReset={handleReset} />
//           )}

//           {/* ── Success / partial failure result (replaces form on done) ── */}
//           {status === "done" && result && (
//             <ResultPanel
//               inserted={result.inserted}
//               failed={result.failed}
//               errors={result.errors}
//               onReset={handleReset}
//             />
//           )}

//           {/* ── Fatal error state ────────────────────────────────────────── */}
//           {status === "error" && (
//             <Card className="border-red-300 dark:border-red-700">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
//                   <XCircle className="h-4 w-4" />
//                   Upload Failed
//                 </CardTitle>
//                 <CardDescription>
//                   A server error occurred. Check the progress log for details.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleReset}
//                   className="gap-2"
//                 >
//                   <RotateCcw className="h-3.5 w-3.5" />
//                   Try Again
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* ── RIGHT: Instructions + live progress ─────────────────────────── */}
//         <div className="space-y-4">
//           {/* Live progress panel — only shown once upload starts */}
//           {steps.length > 0 && (
//             <ProgressPanel
//               steps={steps}
//               percent={percent}
//               isActive={isUploading}
//             />
//           )}

//           {/* Instructions card — always visible */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm">How to Use</CardTitle>
//             </CardHeader>
//             <CardContent className="text-xs text-muted-foreground space-y-3">
//               {[
//                 {
//                   step: "1",
//                   title: "Download the template",
//                   body: 'Click "Download Template" above and open it in Excel.',
//                 },
//                 {
//                   step: "2",
//                   title: "Fill in your products",
//                   body: "Each row = one variant. Repeat product-level fields (name, category, specs) on every row for the same product.",
//                 },
//                 {
//                   step: "3",
//                   title: "Name your images",
//                   body: "Use filenames with no spaces (e.g. handle_brass_96.jpg). Enter these exact filenames in the image columns.",
//                 },
//                 {
//                   step: "4",
//                   title: "Upload together",
//                   body: "Select your Excel file and your images folder, then click Start Bulk Upload.",
//                 },
//                 {
//                   step: "5",
//                   title: "Fix any errors",
//                   body: "If validation fails, the exact row numbers and column names will be listed. Fix them in Excel and re-upload.",
//                 },
//               ].map(({ step, title, body }) => (
//                 <div key={step} className="flex gap-3">
//                   <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
//                     {step}
//                   </span>
//                   <div>
//                     <p className="font-medium text-foreground">{title}</p>
//                     <p className="mt-0.5">{body}</p>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
