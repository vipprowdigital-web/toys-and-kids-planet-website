"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Code2Icon,
  LinkIcon,
  Redo2Icon,
  Undo2Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getToken } from "~/utils/auth";

export function RichTextEditor({
  label = "Description",
  value,
  onChange,
  error,
  placeholder = "Write something amazing...",
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
  extensions: [
    StarterKit,
    Bold,
    Italic,
    Underline,
    BulletList,
    OrderedList,
    Blockquote,
    CodeBlock,
    Heading.configure({ levels: [1, 2, 3] }),
    Link.configure({ openOnClick: true }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: "rounded-md max-w-full my-3",
      },
    }),
    Placeholder.configure({ placeholder }),
  ],
  content: value,

  immediatelyRender: false, // ✅ YAHI ADD KARNA HAI

  editorProps: {
    attributes: {
      class:
        "min-h-[200px] focus:outline-none prose prose-sm sm:prose-base max-w-none dark:prose-invert",
    },
  },
  onUpdate: ({ editor }) => onChange(editor.getHTML()),
});


  // const editor = useEditor({
  //   extensions: [
  //     StarterKit,
  //     Bold,
  //     Italic,
  //     Underline,
  //     BulletList,
  //     OrderedList,
  //     Blockquote,
  //     CodeBlock,
  //     Heading.configure({ levels: [1, 2, 3] }),
  //     Link.configure({ openOnClick: true }),
  //     Image.configure({
  //       inline: false,
  //       allowBase64: true,
  //       HTMLAttributes: {
  //         class: "rounded-md max-w-full my-3",
  //       },
  //     }),
  //     Placeholder.configure({ placeholder }),
  //   ],
  //   content: value,
  //   editorProps: {
  //     handlePaste(view, event) {
  //       const html = event.clipboardData?.getData("text/html");
  //       const plain = event.clipboardData?.getData("text/plain");

  //       if (html) {
  //         const parser = new DOMParser();
  //         const doc = parser.parseFromString(html, "text/html");
  //         const imgs = doc.querySelectorAll("img");
  //         imgs.forEach((img) => {
  //           const src = img.getAttribute("src");
  //           if (src && !src.startsWith("data:")) {
  //             img.setAttribute("referrerpolicy", "no-referrer");
  //           }
  //         });
  //         editor?.commands.insertContent(doc.body.innerHTML);
  //         return true;
  //       }

  //       if (plain) {
  //         editor?.commands.insertContent(plain);
  //         return true;
  //       }

  //       return false;
  //     },
  //     attributes: {
  //       class:
  //         "min-h-[200px] focus:outline-none prose prose-sm sm:prose-base max-w-none dark:prose-invert relative",
  //     },
  //   },
  //   onUpdate: ({ editor }) => onChange(editor.getHTML()),
  // });

 useEffect(() => {
  if (!editor) return;

  const current = editor.getHTML();

  if (value && current !== value) {
    editor.commands.setContent(value, false);
  }
}, [value, editor]);

  // ✅ Upload image manually to Cloudinary
  const handleImageUpload = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        toast.loading("Uploading image...");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/upload/image`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
          }
        );

        const data = await res.json();
        toast.dismiss();

        if (!res.ok) throw new Error(data.message || "Upload failed");

        editor
          ?.chain()
          .focus()
          .setImage({ src: data.url, alt: data.public_id })
          .run();
        toast.success("Image uploaded!");
      } catch (err: any) {
        console.error("Image upload failed:", err);
        toast.dismiss();
        toast.error("Failed to upload image.");
      }
    };

    fileInput.click();
  };

  // ✅ Tooltip for deleting any image (pasted or uploaded)
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const tooltip = document.createElement("button");
    tooltip.innerHTML = "🗑";
    tooltip.title = "Delete image";
    tooltip.className =
      "absolute z-50 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 opacity-0 pointer-events-none transition-all duration-200 cursor-pointer";
    document.body.appendChild(tooltip);

    let currentImage: HTMLImageElement | null = null;

    const showTooltip = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        currentImage = target as HTMLImageElement;
        const rect = target.getBoundingClientRect();
        tooltip.style.top = `${window.scrollY + rect.top + 4}px`;
        tooltip.style.left = `${window.scrollX + rect.right - 28}px`;
        tooltip.style.opacity = "1";
        tooltip.style.pointerEvents = "auto";
      } else {
        tooltip.style.opacity = "0";
        tooltip.style.pointerEvents = "none";
      }
    };

    const handleDelete = () => {
      if (!currentImage) return;
      if (confirm("Remove this image?")) {
        currentImage.remove();
        tooltip.style.opacity = "0";
        tooltip.style.pointerEvents = "none";
      }
    };

    tooltip.addEventListener("click", handleDelete);
    container.addEventListener("mousemove", showTooltip);

    return () => {
      tooltip.remove();
      container.removeEventListener("mousemove", showTooltip);
    };
  }, [editor]);

  const setLink = () => {
    const url = window.prompt("Enter a URL:");
    if (url) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border rounded-md bg-muted/30 p-1">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        {[1, 2, 3].map((level) => (
          <Button
            key={level}
            type="button"
            variant={
              editor.isActive("heading", { level: level as 1 | 2 | 3 })
                ? "default"
                : "ghost"
            }
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run()
            }
          >
            {level === 1 ? (
              <Heading1Icon className="h-4 w-4" />
            ) : level === 2 ? (
              <Heading2Icon className="h-4 w-4" />
            ) : (
              <Heading3Icon className="h-4 w-4" />
            )}
          </Button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2Icon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2Icon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2Icon className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorContainerRef}
        className={`tiptap-editor border rounded-md p-3 bg-background transition-all relative ${
          error
            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-300"
            : "border-border focus-within:ring-2 focus-within:ring-primary/30"
        }`}
      >
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
