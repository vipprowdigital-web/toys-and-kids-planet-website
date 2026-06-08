// console\app\features\feedback\index.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import FeedbackForm from "./components/form";
import { DialogOverlay } from "@radix-ui/react-dialog";

export default function FeedbackModalPage() {
  return (
    <Dialog open>
        <DialogOverlay className="bg-transparent" />
      <DialogContent
        className="sm:max-w-sm
          max-h-[90vh]
          overflow-y-auto
          px-2
          py-4
          [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="w-full text-center">
            Send Feedback
          </DialogTitle>
        </DialogHeader>

        <FeedbackForm />
      </DialogContent>
    </Dialog>
  );
}
