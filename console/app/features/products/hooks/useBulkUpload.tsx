// app/features/products/hooks/useBulkUpload.ts

import { useState, useCallback } from "react";
import { getToken } from "~/utils/auth";

// ── Types ──────────────────────────────────────────────────────────────────

export type UploadStatus =
  | "idle"
  | "uploading"
  | "validation_failed"
  | "done"
  | "error";

export interface ProgressStep {
  message: string;
  percent?: number;
}

export interface BulkUploadResult {
  inserted: number;
  failed: number;
  errors: string[];
}

interface UseBulkUploadReturn {
  status: UploadStatus;
  steps: ProgressStep[];
  percent: number;
  validationErrors: string[];
  result: BulkUploadResult | null;
  startUpload: (excelFile: File, imageFiles: File[]) => Promise<void>;
  reset: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useBulkUpload(): UseBulkUploadReturn {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [percent, setPercent] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const addStep = useCallback((step: ProgressStep) => {
    setSteps((prev) => [...prev, step]);
    if (step.percent !== undefined) setPercent(step.percent);
  }, []);

  const handleEvent = useCallback(
    (event: Record<string, any>) => {
      switch (event.type) {
        case "progress":
          addStep({ message: event.message, percent: event.percent });
          break;

        case "validation_errors":
          setStatus("validation_failed");
          setValidationErrors(event.errors ?? []);
          addStep({ message: event.message, percent: event.percent });
          break;

        case "done":
          setStatus("done");
          setPercent(100);
          addStep({ message: event.message, percent: 100 });
          setResult({
            inserted: event.inserted ?? 0,
            failed: event.failed ?? 0,
            errors: event.errors ?? [],
          });
          break;

        case "error":
          setStatus("error");
          addStep({ message: event.message });
          break;

        default:
          break;
      }
    },
    [addStep],
  );

  const startUpload = useCallback(
    async (excelFile: File, imageFiles: File[]) => {
      // Reset state and show progress panel immediately with a local step
      setStatus("uploading");
      setSteps([{ message: "Preparing upload…", percent: 0 }]);
      setPercent(0);
      setValidationErrors([]);
      setResult(null);

      const formData = new FormData();
      formData.append("excel", excelFile);
      for (const img of imageFiles) {
        formData.append("images", img, img.name);
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/bulk-upload`,
          {
            method: "POST",
            body: formData,
            // Do NOT set Content-Type — browser sets it with the multipart boundary
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Server responded with HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body received from server.");
        }

        // ── Consume the SSE stream ────────────────────────────────────────
        // We read chunks as they arrive and split on the "\n\n" SSE separator.
        // Chunks don't always align with event boundaries, so we buffer.
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on the SSE event separator "\n\n"
          const parts = buffer.split("\n\n");
          // The last element may be an incomplete event — keep it in buffer
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const dataLine = part
              .split("\n")
              .find((l) => l.startsWith("data:"))
              ?.replace(/^data:\s*/, "")
              .trim();

            if (!dataLine) continue;

            try {
              const parsed = JSON.parse(dataLine);
              handleEvent(parsed);
            } catch {
              // Malformed SSE frame — skip silently
            }
          }
        }

        // Handle any remaining buffered data after stream closes
        if (buffer.trim()) {
          const dataLine = buffer
            .split("\n")
            .find((l) => l.startsWith("data:"))
            ?.replace(/^data:\s*/, "")
            .trim();
          if (dataLine) {
            try {
              handleEvent(JSON.parse(dataLine));
            } catch {
              // ignore
            }
          }
        }
      } catch (err: any) {
        setStatus("error");
        addStep({
          message: `Connection error: ${err.message}. Please check your network and try again.`,
        });
      }
    },
    [addStep, handleEvent],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setSteps([]);
    setPercent(0);
    setValidationErrors([]);
    setResult(null);
  }, []);

  return {
    status,
    steps,
    percent,
    validationErrors,
    result,
    startUpload,
    reset,
  };
}

// import { useState, useCallback } from "react";
// import { getToken } from "~/utils/auth";

// // ── Types ──────────────────────────────────────────────────────────────────

// export type UploadStatus =
//   | "idle"
//   | "uploading"
//   | "validation_failed"
//   | "done"
//   | "error";

// export interface ProgressStep {
//   message: string;
//   percent?: number;
// }

// export interface BulkUploadResult {
//   inserted: number;
//   failed: number;
//   errors: string[];
// }

// interface UseBulkUploadReturn {
//   status: UploadStatus;
//   steps: ProgressStep[];
//   percent: number;
//   validationErrors: string[];
//   result: BulkUploadResult | null;
//   startUpload: (excelFile: File, imageFiles: File[]) => Promise<void>;
//   reset: () => void;
// }

// // ── Hook ───────────────────────────────────────────────────────────────────

// export function useBulkUpload(): UseBulkUploadReturn {
//   const [status, setStatus] = useState<UploadStatus>("idle");
//   const [steps, setSteps] = useState<ProgressStep[]>([]);
//   const [percent, setPercent] = useState(0);
//   const [validationErrors, setValidationErrors] = useState<string[]>([]);
//   const [result, setResult] = useState<BulkUploadResult | null>(null);

//   // ── Append a new step to the progress log ───────────────────────────────
//   const addStep = useCallback((step: ProgressStep) => {
//     setSteps((prev) => [...prev, step]);
//     if (step.percent !== undefined) setPercent(step.percent);
//   }, []);

//   // ── Process a single parsed SSE event object ────────────────────────────
//   const handleEvent = useCallback(
//     (event: Record<string, any>) => {
//       switch (event.type) {
//         case "progress":
//           addStep({ message: event.message, percent: event.percent });
//           break;

//         case "validation_errors":
//           // The server found problems in the Excel rows. Nothing was inserted.
//           setStatus("validation_failed");
//           // console.log("ERROR WHILE PARSING FILE: ", event.errors);

//           setValidationErrors(event.errors ?? []);
//           addStep({ message: event.message });
//           break;

//         case "done":
//           setStatus("done");
//           setPercent(100);
//           addStep({ message: event.message, percent: 100 });
//           setResult({
//             inserted: event.inserted ?? 0,
//             failed: event.failed ?? 0,
//             errors: event.errors ?? [],
//           });
//           break;

//         case "error":
//           // Fatal server-side error (e.g. Cloudinary down, DB connection lost)
//           setStatus("error");
//           addStep({ message: `${event.message}` });
//           break;

//         default:
//           break;
//       }
//     },
//     [addStep],
//   );

//   // ── Main upload function ─────────────────────────────────────────────────
//   const startUpload = useCallback(
//     async (excelFile: File, imageFiles: File[]) => {
//       // Reset everything before starting a fresh upload
//       setStatus("uploading");
//       setSteps([]);
//       setPercent(0);
//       setValidationErrors([]);
//       setResult(null);

//       // Build the multipart payload.
//       // Field names must exactly match what the multer middleware expects:
//       //   "excel"  → single .xlsx file
//       //   "images" → all image files (up to 5000)
//       const formData = new FormData();
//       formData.append("excel", excelFile);
//       for (const img of imageFiles) {
//         formData.append("images", img, img.name);
//       }

//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/bulk-upload`,
//           {
//             method: "POST",
//             body: formData,
//             headers: {
//               // Do NOT set Content-Type manually here — the browser sets it
//               // automatically for FormData and includes the required boundary
//               // parameter. Setting it manually would break multipart parsing.
//               Authorization: `Bearer ${getToken()}`,
//             },
//           },
//         );

//         if (!response.ok) {
//           throw new Error(`Server responded with HTTP ${response.status}`);
//         }

//         if (!response.body) {
//           throw new Error("No response body received from server.");
//         }

//         // ── Consume the SSE stream ─────────────────────────────────────────
//         // response.body is a ReadableStream<Uint8Array>. We read it chunk by
//         // chunk and decode it. Chunks don't always align with SSE event
//         // boundaries, so we keep a buffer of undecoded text and split on "\n\n"
//         // (the SSE event separator) only when we have a complete event.
//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = "";

//         while (true) {
//           const { value, done } = await reader.read();
//           if (done) break;

//           buffer += decoder.decode(value, { stream: true });

//           // Split on the SSE event separator "\n\n".
//           // The last element may be an incomplete event — put it back in the buffer.
//           const parts = buffer.split("\n\n");
//           buffer = parts.pop() ?? "";

//           for (const part of parts) {
//             // Each complete SSE event looks like: "data: {...json...}"
//             const dataLine = part.replace(/^data:\s*/, "").trim();
//             if (!dataLine) continue;

//             try {
//               const parsed = JSON.parse(dataLine);
//               handleEvent(parsed);
//             } catch {
//               // Malformed SSE frame — skip it silently
//             }
//           }
//         }
//       } catch (err: any) {
//         setStatus("error");
//         addStep({
//           message: `Connection error: ${err.message}. Please check your network and try again.`,
//         });
//       }
//     },
//     [addStep, handleEvent],
//   );

//   // ── Reset back to idle so the admin can start a new upload ──────────────
//   const reset = useCallback(() => {
//     setStatus("idle");
//     setSteps([]);
//     setPercent(0);
//     setValidationErrors([]);
//     setResult(null);
//   }, []);

//   return {
//     status,
//     steps,
//     percent,
//     validationErrors,
//     result,
//     startUpload,
//     reset,
//   };
// }
