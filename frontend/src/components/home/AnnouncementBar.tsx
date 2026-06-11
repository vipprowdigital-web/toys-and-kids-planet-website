"use client";
import { useState, useEffect } from "react";
import { announcementMessages } from "@/data/index";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcementMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-brand-navy text-white text-sm py-2 px-4 relative overflow-hidden">
      <div className="container-custom flex items-center justify-center">
        <div
          className="flex-1 text-center font-medium tracking-wide animate-fade-in"
          key={current}
        >
          {announcementMessages[current]}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          aria-label="Close announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
